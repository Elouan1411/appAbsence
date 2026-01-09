import React, { useState } from "react";
import "../../style/Teacher.css";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";
import SelectTime from "../../components/Teacher/SelectTime";
import SelectSubject from "../../components/Teacher/SelectSubject";
import PageTitle from "../../components/common/PageTitle";

function RollCallPage() {
  const [selection, setSelection] = useState(null);
  const [dateTime, setDateTime] = useState({ date: "", startTime: "", endTime: "" });
  const [subject, setSubject] = useState("");

  return (
    <div className="page-container">
      <PageTitle title="Faire l'appel" icon="appel" />  
      
      <div className="select-container">
          <SelectGroup 
            onValidate={(sel) => setSelection(sel)} 
            date={dateTime.date}
            className="select-item-large"
            initialData={null} 
          />

           <SelectTime 
             onChange={setDateTime} 
             value={dateTime}
             className="select-item"
           />

           <SelectSubject 
             onSelect={setSubject} 
             promo={selection?.promo}
             pair={selection?.semestre}
             className="select-item"
             value={subject} 
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
