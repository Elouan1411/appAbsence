import React, { useState } from "react";
import Title from "../../components/common/Title";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";

function RollCallPage() {
  const [selection, setSelection] = useState(null);

  return (
    <div>
        <Title>Page d'appel</Title>
        <SelectGroup onValidate={setSelection} />
        <RollCallList criteria={selection} />
    </div>
  );
}

export default RollCallPage;
