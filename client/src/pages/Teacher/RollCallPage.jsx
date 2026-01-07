import React, { useState } from "react";
import Title from "../../components/common/Title";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";
import SelectTime from "../../components/Teacher/SelectTime";
import SelectSubject from "../../components/Teacher/SelectSubject";

function RollCallPage() {
  const [selection, setSelection] = useState(null);
  const [dateTime, setDateTime] = useState({ date: "", startTime: "", endTime: "" });
  const [subject, setSubject] = useState("");

  return (
    <div style={{ padding: "1rem", height: "97.5%", display: "flex", flexDirection: "column" }}>
      <Title>Faire l'appel</Title>  
      
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginTop: "1rem" }}>
          <SelectGroup 
            onValidate={(sel) => setSelection(sel)} 
            date={dateTime.date}
            style={{ flex: 2, minWidth: "300px" }}
          />

           <SelectTime 
             onChange={setDateTime} 
             style={{ flex: 1, minWidth: "300px" }}
           />

           <SelectSubject 
             onSelect={setSubject} 
             promo={selection?.promo}
             pair={selection?.semestre}
             style={{ flex: 1, minWidth: "300px" }}
           />
      </div>

      <RollCallList 
        criteria={selection} 
        dateTime={dateTime}
        subject={subject}
      />
    </div>
  );
}

export default RollCallPage;
