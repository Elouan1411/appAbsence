CREATE TABLE "RelationMatiereEleve" (
    "codeMatiere" INTEGER NOT NULL,
    "numeroEleve" INTEGER NOT NULL,
    "presenceObligatoire" INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY("codeMatiere", "numeroEleve")
);
CREATE TABLE "RSEAnnee" (
    "numeroEtudiant" INTEGER NOT NULL,
    "codeRSE" INTEGER NOT NULL,
    PRIMARY KEY("numeroEtudiant", "codeRSE")
);
CREATE TABLE "RSE" (
    "code" INTEGER NOT NULL UNIQUE,
    "libelle" TEXT NOT NULL,
    PRIMARY KEY("code" AUTOINCREMENT)
);
CREATE TABLE "Eleve" (
    "numero" INTEGER NOT NULL UNIQUE,
    "loginENT" TEXT NOT NULL UNIQUE,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "promo" TEXT NOT NULL,
    "groupeTD" TEXT NOT NULL,
    "groupeTP" TEXT NOT NULL,
    "promoPair" TEXT,
    "groupeTDPair" INTEGER,
    "groupeTPPair" TEXT
);
CREATE TABLE Appel(
    idAppel INTEGER PRIMARY KEY AUTOINCREMENT,
    debut INTEGER NOT NULL,
    fin INTEGER NOT NULL,
    loginProfesseur TEXT NOT NULL,
    codeMatiere INTEGER NOT NULL,
    promo TEXT,
    groupeTD TEXT,
    groupeTP TEXT
);
CREATE TABLE "JustificationAbsence" (
    "idAbsJustifiee" INTEGER NOT NULL UNIQUE,
    "numeroEtudiant" INTEGER NOT NULL,
    "debut" INTEGER NOT NULL,
    "fin" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "validite" INTEGER,
    "motifValidite" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "dateDemande" INTEGER NOT NULL,
    PRIMARY KEY("idAbsJustifiee" AUTOINCREMENT)
);
CREATE TABLE "Absence" (
    "idAbsence" INTEGER PRIMARY KEY AUTOINCREMENT,
    "numeroEtudiant" INTEGER NOT NULL,
    "idAppel" INTEGER NOT NULL,
    "login" TEXT,
    CONSTRAINT "fk_appel" FOREIGN KEY ("idAppel") REFERENCES "Appel" ("idAppel") ON DELETE CASCADE
);
CREATE TABLE Professeur (
    loginENT TEXT PRIMARY KEY NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    administrateur BOOLEAN DEFAULT 0
);
CREATE TABLE Matiere (
    code INTEGER PRIMARY KEY,
    promo TEXT NOT NULL,
    libelle TEXT NOT NULL,
    spair INTEGER
);