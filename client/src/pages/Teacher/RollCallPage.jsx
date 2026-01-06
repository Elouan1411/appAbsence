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
    <div style={{ padding: "1rem" }}>
      <Title>Faire l'appel</Title>  
      
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginTop: "1rem" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <SelectGroup 
            onValidate={(sel) => setSelection(sel)} 
            date={dateTime.date}
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
           <SelectTime onChange={setDateTime} />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
           <SelectSubject 
             onSelect={setSubject} 
             promo={selection?.promo}
             pair={selection?.semestre}
           />
        </div>
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
