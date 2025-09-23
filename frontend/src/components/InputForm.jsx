import React from "react";

const InputForm = (props) => {
  // This spreads all props onto the input element!
  return <input {...props} className="form-control" />;
};

export default InputForm;
