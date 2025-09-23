const LabelComp = ({ htmlFor, displayText }) => {
    return (
      <label htmlFor={htmlFor} className="form-label">
        {displayText}
      </label>
    )
  }
  
  export default LabelComp
  