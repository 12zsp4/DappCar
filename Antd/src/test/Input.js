
function Input(props) {
    return (
        <div className="App">
            <label> { props.lable}</label>
            <input type={props.type} placeholder={props.inputPlaceholder} />
        </div>
    );
}

export default Input;