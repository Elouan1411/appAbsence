import React from "react";
import Title from "../../components/common/Title";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";

function RollCall() {
  return (
    <div>
        <Title>Page d'appel</Title>
        <SelectGroup/>
        <RollCallList/>
    
    </div>
  );
}

export default RollCallPage;
