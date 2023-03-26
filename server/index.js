const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body

//Routes//

//Create chaine

app.post("/ehotel", async(req, res) => {
    try {
        const { nom, adresse, email, phone } = req.body;
        const newChaine = await pool.query(
            "INSERT INTO projet1.chaine_hoteliere(nom, adresse, email, phone) VALUES($1, $2, $3, $4);",
            [nom, adresse, email, phone]
            );
        
        res.json(newChaine.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//Get all chaines

app.get("/ehotel", async(req, res) => {
    try {
        const allChaines = await pool.query("SELECT * FROM projet1.chaine_hoteliere;");
        res.json(allChaines.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//Get all chambres

app.get("/chambres", async(req, res) => {
    try {
        const { capacity, hilton, sheraton, holidayinn, bestwestern, times, ville, minPrice, maxPrice, minStars, maxStars, startDate, endDate } = req.query
        console.log(req.query)
        await pool.query("set search_path to projet1;");
        const allChambres = await pool.query("SELECT R.chambre_ID, C.nom, H.ville, H.adresse, H.classification, R.capacity, R.prix\
        FROM chaine_hoteliere C JOIN hotel H ON C.chaine_ID = H.chaine_ID JOIN chambre R ON H.hotel_ID = R.hotel_ID\
        WHERE R.capacity >= $1\
        AND C.nom IN ($2, $3, $4, $5, $6)\
        AND ($7 = 'all' OR H.ville = $7)\
        AND R.prix BETWEEN $8 AND $9\
        AND H.classification BETWEEN $10 AND $11\
        AND NOT EXISTS (SELECT * FROM reservation\
            WHERE reservation.chambre_ID = R.chambre_ID\
	        AND reservation.active = TRUE\
            AND (reservation.date_debut <= $13 AND reservation.date_fin >= $12))\
        AND NOT EXISTS (SELECT * FROM location\
            WHERE location.chambre_ID = R.chambre_ID\
	        AND location.active = TRUE\
            AND (location.date_debut <= $13 AND location.date_fin >= $12));",
        [capacity, hilton, sheraton, holidayinn, bestwestern, times, ville, minPrice, maxPrice, minStars, maxStars, startDate, endDate]);
        res.json(allChambres.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//Get a chaine

app.get("/ehotel/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const chaine = await pool.query("SELECT * FROM projet1.chaine_hoteliere WHERE chaine_id = $1", 
        [id]
        );

        res.json(chaine.rows);
    } catch (err) {
        console.error(err.message);
    }
})

//update a chaine

app.put("/ehotel/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { phone } = req.body;
        const updateChaine = await pool.query("UPDATE projet1.chaine_hoteliere SET phone = $1 WHERE chaine_id = $2", 
        [phone, id]
        );

        res.json("Chaine was updated!")
    } catch (err) {
        console.error(err.message);
    }
})

//delete a chaine

app.delete("/ehotel/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const deleteChaine = await pool.query("DELETE FROM projet1.chaine_hoteliere WHERE chaine_id = $1", 
        [id]
        );

        res.json("Chaine was deleted!")
    } catch (err) {
        console.error(err.message);
    }
})

app.listen(5000, () => {
    console.log("Server has started on port 5000");
})