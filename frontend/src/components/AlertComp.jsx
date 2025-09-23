const AlertComp = ({ alertType, text }) => {
    return (
      <div className={`alert ${alertType}`} role="alert">
        {text}
      </div>
    )
  }
  
  export default AlertComp
  