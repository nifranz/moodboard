CREATE TABLE organisation 
(
    pk_org_id int NOT NULL, 
    org_name char(50), 
    PRIMARY KEY (pk_org_id)
);

CREATE TABLE mitarbeiter 
(
    pk_ma_id int NOT NULL, 
    fk_org_id int NOT NULL, 
    ma_name char(50), 
    email char(25), 
    PRIMARY KEY (pk_ma_id), 
    FOREIGN KEY (fk_org_id) REFERENCES organisation (pk_org_id)
);

INSERT INTO organisation(pk_org_id, org_name)
VALUES (01, 'LSWI Lehrstuhl');