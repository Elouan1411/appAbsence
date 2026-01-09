import "../../style/Checkbox.css";

function Checkbox({ checked, onChange, label }) {
    return (
        <label className="checkbox">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="checkmark" />
            {label}
        </label>
    );
}

export default Checkbox;
