package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn *websocket.Conn
	send  chan []byte
	room *Room
}

type Room struct {
	id       string
	password string
	clients  map[*Client]bool
	code     string
	mutex    sync.Mutex
}

var rooms = make(map[string]*Room)
var roomsMutex sync.Mutex

func main() {
	r := gin.Default()

	r.GET("/create", createRoomWS)
	r.GET("/join", joinRoomWS)

	log.Println("Server running on :8080")
	r.Run(":8080")
}

func createRoomWS(c *gin.Context) {
	roomID := c.Query("roomId")
	password := c.Query("password")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	roomsMutex.Lock()
	if _, exists := rooms[roomID]; exists {
		roomsMutex.Unlock()
		conn.WriteMessage(websocket.TextMessage, []byte("room already exists"))
		conn.Close()
		return
	}

	room := &Room{
		id:       roomID,
		password: password,
		clients:  make(map[*Client]bool),
		code:     "",
	}
	rooms[roomID] = room
	roomsMutex.Unlock()

	joinRoom(conn, room)
}

func joinRoomWS(c *gin.Context) {
	roomID := c.Query("roomId")
	password := c.Query("password")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	roomsMutex.Lock()
	room, exists := rooms[roomID]
	roomsMutex.Unlock()

	if !exists || room.password != password {
		conn.WriteMessage(websocket.TextMessage, []byte("invalid room or password"))
		conn.Close()
		return
	}

	joinRoom(conn, room)
}

func joinRoom(conn *websocket.Conn, room *Room) {
	client := &Client{
		conn: conn,
		send: make(chan []byte),
		room: room,
	}

	room.mutex.Lock()
	room.clients[client] = true
	code := room.code
	room.mutex.Unlock()

	go client.writePump()
	if code != "" {
		client.send <- []byte(code)
	}
	client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.room.mutex.Lock()
		delete(c.room.clients, c)
		empty := len(c.room.clients) == 0
		c.room.mutex.Unlock()

		close(c.send)
		c.conn.Close()

		if empty {
			roomsMutex.Lock()
			delete(rooms, c.room.id)
			roomsMutex.Unlock()
		}
	}()

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		newCode := string(data)

		c.room.mutex.Lock()
		c.room.code = newCode
		c.room.mutex.Unlock()

		c.broadcast([]byte(newCode))
	}
}

func (c *Client) writePump() {
	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}

func (c *Client) broadcast(msg []byte) {
	c.room.mutex.Lock()
	defer c.room.mutex.Unlock()

	for client := range c.room.clients {
		select {
		case client.send <- msg:
		default:
			delete(c.room.clients, client)
		}
	}
}
