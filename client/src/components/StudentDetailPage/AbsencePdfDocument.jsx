import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import dateFormatter from "../../functions/dateFormatter";

const styles = StyleSheet.create({
    page: { 
        padding: 30, 
        fontFamily: "Helvetica", 
        fontSize: 11 
    },
    header: { 
        marginBottom: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: "#112131", 
        paddingBottom: 10 
    },
    TitleContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    title: { 
        fontSize: 24, 
        textAlign: "center", 
        fontWeight: "bold",
        justifyContent: "center",
        marginBottom: 5, 
        color: "#112131" 
    },
    infoContainer: { 
        flexDirection: "row", 
        justifyContent: "space-between" 
    },
    table: { 
        display: "table", 
        width: "auto", 
        borderStyle: "solid", 
        borderWidth: 1, 
        borderRightWidth: 0, 
        borderBottomWidth: 0 
    },
    row: { 
        flexDirection: "row" 
    },
    col: { 
        width: "20%", 
        borderStyle: "solid", 
        borderWidth: 1, 
        borderLeftWidth: 0, 
        borderTopWidth: 0 
    },
    cell: { 
        margin: 5, 
        fontSize: 10, 
        textAlign: "center" 
    },
    headerCell: { 
        fontWeight: "bold" 
    },
    footer: { 
        position: "absolute", 
        bottom: 30, 
        left: 0, 
        right: 0, 
        textAlign: "center", 
        fontSize: 10, 
        color: "grey" 
    },
});

const AbsencePdfDocument = ({ student, absences }) => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const month = date.getMonth();
    const startingYear = month < 8 ? currentYear - 1 : currentYear;
    const endingYear = month < 8 ? currentYear : currentYear + 1;
    const absenceList = Object.values(absences).sort(
        (a, b) => new Date(b.debut) - new Date(a.debut)
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.TitleContainer}>
                        <Text style={styles.title}>Relevé d'absences {startingYear} / {endingYear}</Text>
                        <Text style={{ fontSize: 15 }}>du 1 septembre {startingYear} au {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</Text>
                    </View>

                    <View>
                    <View style={styles.infoContainer}>
                        <View>
                            <Text>Nom : {student.nom}</Text>
                            <Text>Prénom : {student.prenom}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text>N° Étudiant : {student.numeroEtudiant}</Text>
                            <Text>Login ENT : {student.loginENT}</Text>
                        </View>
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                <Text>Promo impair: {student.promo}</Text>
                                <Text> TD impair : {student.groupeTD}</Text>
                                <Text> TP impair : {student.groupeTP}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text>Promo pair: {student.promoPair}</Text>
                                <Text> TD pair : {student.groupeTDPair}</Text>
                                <Text> TP pair : {student.groupeTPPair}</Text>
                            </View>
                    </View>
                </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.row} fixed>
                        <View style={styles.col}>
                            <Text style={[styles.cell, styles.headerCell]}>Date & Heure de début</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.cell, styles.headerCell]}>Date & Heure de fin</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.cell, styles.headerCell]}>Matière</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.cell, styles.headerCell]}>Enseignant</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.cell, styles.headerCell]}>Justifiée</Text>
                        </View>
                    </View>

                    {absenceList.map((absence, index) => (
                        <View key={index} style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.cell}>{dateFormatter(absence.debut)}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.cell}>{dateFormatter(absence.fin)}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.cell}>
                                {absence.libelle} ({absence.groupeTP ? "TP" : absence.groupeTD ? "TD" : "CM"})
                                </Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.cell}>
                                {absence.prenom} {absence.nom?.toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.cell}>{absence.justifie ? "Oui" : "Non"}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.footer}>
                    Généré le {new Date().toLocaleDateString("fr-FR")}
                    {"\n"}
                    Nombre total d'absences : {absenceList.length}
                </Text>
            </Page>
        </Document>
    );
};

export default AbsencePdfDocument;
