package main

import (
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	myHttp "github.com/thantko20/synapse-donations/backend/http"
)

func main() {

	db, err := sqlx.Connect("pgx", "postgresql://postgres:password@localhost:5432/synapse_donations_db")

	if err != nil {
		log.Fatalln(err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	defer db.Close()

	log.Print("Connection to Database: SUCCESS")
	server := myHttp.NewServer(db)

	log.Fatal(server.Run(":8080"))
}
