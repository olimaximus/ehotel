set search_path to projet1;

CREATE TABLE chaine_hoteliere (
	chaine_ID SERIAL PRIMARY KEY,
	nom VARCHAR(255) NOT NULL,
	adresse VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone VARCHAR(15) NOT NULL,
	CONSTRAINT chk_adresse CHECK (adresse ~ '^[\d]+,? [\w \-'']+$'),
	CONSTRAINT chk_email CHECK (email like '%_@__%.__%'),
	CONSTRAINT chk_phone CHECK (phone ~ '^[0-9]{7,15}$')
);

CREATE TABLE hotel (
	hotel_ID SERIAL PRIMARY KEY,
	adresse VARCHAR(255) NOT NULL,
	ville VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone VARCHAR(15) NOT NULL,
	classification DECIMAL NOT NULL,
	chaine_ID INTEGER NOT NULL,
	CONSTRAINT chk_adresse CHECK (adresse ~ '^[\d]+,? [\w \-'']+$'),
	CONSTRAINT chk_email CHECK (email like '%_@__%.__%'),
	CONSTRAINT chk_phone CHECK (phone ~ '^[0-9]{7,15}$'),
	CONSTRAINT chk_class CHECK (classification IN (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)),
	FOREIGN KEY (chaine_id) REFERENCES chaine_hoteliere
);

CREATE TABLE chambre (
	chambre_ID SERIAL PRIMARY KEY,
	num_chambre INTEGER NOT NULL,
	prix DECIMAL(7,2) NOT NULL,
	capacity INTEGER NOT NULL,
	tv BOOL NOT NULL,
	ac BOOL NOT NULL,
	fridge BOOL NOT NULL,
	vue VARCHAR(255) NOT NULL,
	extendable BOOL NOT NULL,
	problemes VARCHAR(255),
	hotel_ID INTEGER NOT NULL,
	CONSTRAINT chk_num CHECK (num_chambre > 0),
	CONSTRAINT unique_num_chambre_par_hotel UNIQUE (num_chambre, hotel_ID),
	CONSTRAINT chk_prix CHECK (prix >= 0),
	CONSTRAINT chk_capacity CHECK (capacity IN (1,2,3,4,5,6,7,8)),
	CONSTRAINT chk_vue CHECK (vue IN ('Mer', 'Montagne', 'Both', 'None')),
	FOREIGN KEY (hotel_id) REFERENCES hotel
);

CREATE TABLE employee (
	employee_ID SERIAL PRIMARY KEY,
	nom VARCHAR(255) NOT NULL,
	prenom VARCHAR(255) NOT NULL,
	adresse VARCHAR(255) NOT NULL,
	nas VARCHAR(9) NOT NULL,
	poste VARCHAR(255) NOT NULL,
	hotel_ID INTEGER NOT NULL,
	CONSTRAINT chk_nom CHECK (nom ~* '^[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ \-'']*$'),
	CONSTRAINT chk_prenom CHECK (prenom ~* '^[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ \-'']*$'),
	CONSTRAINT chk_adresse CHECK (adresse ~ '^[\d]+,? [\w \-'']+$'),
	CONSTRAINT chk_nas CHECK (nas ~ '^[\d]{9}$'),
	CONSTRAINT chk_poste CHECK (poste IN ('Gestionnaire', 'Réceptionniste', 'Groom', 'Personne de ménage', 'Serveur', 'Chef de cuisine', 'Agent sécurité')),
	FOREIGN KEY (hotel_id) REFERENCES hotel
);

CREATE TABLE client (
	client_ID SERIAL PRIMARY KEY,
	nom VARCHAR(255) NOT NULL,
	prenom VARCHAR(255) NOT NULL,
	adresse VARCHAR(255) NOT NULL,
	nas VARCHAR(9) NOT NULL,
	date_enregistrement TIMESTAMP DEFAULT NOW(),
	CONSTRAINT chk_nom CHECK (nom ~* '^[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ \-'']*$'),
	CONSTRAINT chk_prenom CHECK (prenom ~* '^[a-zàâçéèêëîïôûùüÿñæœ][a-zàâçéèêëîïôûùüÿñæœ \-'']*$'),
	CONSTRAINT chk_adresse CHECK (adresse ~ '^[\d]+,? [\w \-'']+$'),
	CONSTRAINT chk_nas CHECK (nas ~ '^[\d]{9}$')
);

CREATE TABLE reservation (
	reservation_ID SERIAL PRIMARY KEY,
	date_debut DATE NOT NULL,
	date_fin DATE NOT NULL,
	date_reservation TIMESTAMP DEFAULT NOW(),
	num_chambre INTEGER NOT NULL,
	active BOOL NOT NULL DEFAULT TRUE,
	chambre_ID INTEGER NOT NULL,
	client_ID INTEGER NOT NULL,
	CONSTRAINT chk_date_fin CHECK (date_fin >= date_debut),
	FOREIGN KEY (chambre_ID) REFERENCES chambre,
	FOREIGN KEY (client_ID) REFERENCES client
);

CREATE TABLE location (
	location_ID SERIAL PRIMARY KEY,
	date_debut DATE NOT NULL,
	date_fin DATE NOT NULL,
	num_chambre INTEGER NOT NULL,
	active BOOL NOT NULL DEFAULT TRUE,
	chambre_ID INTEGER NOT NULL,
	client_ID INTEGER NOT NULL,
	employee_ID INTEGER NOT NULL,
	reservation_ID INTEGER,
	CONSTRAINT chk_date_fin CHECK (date_fin >= date_debut),
	FOREIGN KEY (chambre_ID) REFERENCES chambre,
	FOREIGN KEY (client_ID) REFERENCES client,
	FOREIGN KEY (reservation_ID) REFERENCES reservation
);

CREATE OR REPLACE FUNCTION check_manager_role() 
RETURNS TRIGGER AS $$
BEGIN
  -- check that the first employee added to a hotel is a manager
  IF NOT EXISTS (
    SELECT 1 FROM employee 
    WHERE hotel_id = NEW.hotel_id AND poste = 'Gestionnaire'
  ) THEN
    IF NEW.poste != 'Gestionnaire' THEN
      RAISE EXCEPTION 'Le premier employé d''un hôtel doit être un Gestionnaire';
    END IF;
  END IF;

  -- check that there is only one manager per hotel
  IF NEW.poste = 'Gestionnaire' THEN
    IF EXISTS (
      SELECT 1 FROM employee 
      WHERE hotel_id = NEW.hotel_id AND poste = 'Gestionnaire' AND employee_ID != NEW.employee_ID
    ) THEN
      RAISE EXCEPTION 'Il ne peut y avoir qu''un seul gestionnaire par hôtel';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_manager_role_trigger
BEFORE INSERT OR UPDATE ON employee
FOR EACH ROW
EXECUTE FUNCTION check_manager_role();



CREATE OR REPLACE FUNCTION update_reservation_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_fin < NOW()::date AND NEW.date_fin <> NOW()::date THEN
        NEW.active = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_active_status_trigger
BEFORE INSERT OR UPDATE ON reservation
FOR EACH ROW
EXECUTE FUNCTION update_reservation_active();

CREATE TRIGGER update_active_status_trigger
BEFORE INSERT OR UPDATE ON location
FOR EACH ROW
EXECUTE FUNCTION update_reservation_active();

UPDATE reservation SET active = false WHERE date_fin < NOW()::date AND date_fin <> NOW()::date AND active = true;
UPDATE location SET active = false WHERE date_fin < NOW()::date AND date_fin <> NOW()::date AND active = true;

CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM reservation
        WHERE chambre_ID = NEW.chambre_ID
        AND date_debut <= NEW.date_fin
        AND date_fin >= NEW.date_debut
        AND active = TRUE
    ) THEN
        RAISE EXCEPTION 'Cette chambre est déjà réservée pendant cette période';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_overlap_check
BEFORE INSERT ON reservation
FOR EACH ROW
EXECUTE FUNCTION check_reservation_overlap();



CREATE OR REPLACE FUNCTION check_location_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM location
        WHERE chambre_ID = NEW.chambre_ID
        AND date_debut <= NEW.date_fin
        AND date_fin >= NEW.date_debut
        AND active = TRUE
    ) THEN
        RAISE EXCEPTION 'Cette chambre est déjà louée pendant cette période';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER location_overlap_check
BEFORE INSERT ON location
FOR EACH ROW
EXECUTE FUNCTION check_location_overlap();