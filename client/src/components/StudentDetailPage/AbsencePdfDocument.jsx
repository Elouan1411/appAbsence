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
    title: { 
        fontSize: 24, 
        textAlign: "center", 
        marginBottom: 15, 
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
        width: "25%", 
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
    const currentYear = new Date().getFullYear();
    const absenceList = Object.values(absences);

    return (
        <Document style={styles.page}>
            <Page size="A4">
                <View style={styles.header}>
                    <Text>Relevé d'absences {currentYear}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View>
                        <Text>Nom : {student.nom} {student.prenom}</Text>
                        <Text>Promo : {student.promo}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text>N° Étudiant : {student.numeroEtudiant}</Text>
                        <Text>Login ENT : {student.loginENT}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text>Date & Heure</Text>
                        </View>
                        <View style={styles.col}>
                            <Text>Matière</Text>
                        </View>
                        <View style={styles.col}>
                            <Text>Prof</Text>
                        </View>
                        <View style={styles.col}>
                            <Text>Justifiée</Text>
                        </View>
                    </View>
                </View>

                {absenceList.map((absence, index) => (
                    <View key={index} style={styles.row}>
                        <View style={styles.col}>
                            <Text>{dateFormatter(absence.debut)}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text>
                            {absence.libelle} ({absence.groupeTP ? "TP" : absence.groupeTD ? "TD" : "CM"})
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text>
                            {absence.prenom} {absence.nom?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text>{absence.justifie ? "Oui" : "Non"}</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.footer}>Généré le {new Date().toLocaleDateString("fr-FR")}</Text>
            </Page>
        </Document>
    );
};

export default AbsencePdfDocument;
