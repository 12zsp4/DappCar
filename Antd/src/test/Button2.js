function MyButton2(props) {
   var c  = props.element 
   
    return (
      <div>
         <button>I'm a button</button>
         {props.element}
      </div>
     
    );
  }

  export default MyButton2