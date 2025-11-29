const PromoSelector = ({ value, onChange }) => {
  return (
    <div className="form-group">
      <label htmlFor="promo">Sélectionnez la Classe/Année :</label>

      <select
        id="promo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="promo-select"
      >
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
        <option value="M1">M1</option>
        <option value="M2">M2</option>
      </select>
    </div>
  );
};

export default PromoSelector;
