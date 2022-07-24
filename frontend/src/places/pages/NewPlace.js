import React, {useReducer, useCallback, useContext} from "react";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";

import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../shared/util/validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import './NewPlace.css';
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

import { useForm } from "../../shared/hooks/form-hook";

// const formReducer = (state, action) => {
//     switch(action.type){
//         case 'INPUT_CHANGE': 
//             let formIsValid = true;
//             for(const inputId in state.inputs){
//                 if(inputId === action.inputId){
//                     formIsValid = formIsValid && action.isValid;
//                 } else {
//                     formIsValid = formIsValid && state.inputs[inputId].isValid;
//                 }
//             }
//             return {
//                 ...state,
//                 inputs: {
//                     ...state.inputs, 
//                     [action.inputId] : {value: action.value, isValid: action.isValid}
//                 },
//                 isValid: formIsValid
//             };
//         default:
//             return state
//     }
// };

const NewPlace = () => {
    // const [formState,dispatch] = useReducer(formReducer, {
    //     inputs: {
    //         title: {
    //             value: '',
    //             isValid: false
    //         },
    //         description: {
    //             value: '',
    //             isValid: false
    //         },
    //         address: {
    //             value: '',
    //             isValid: false
    //         }
    //     },
    //     isValid: false
    // });

    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    

    const [formState, inputHandler] = useForm({title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: '',
            isValid: false
        },
        image: {
            value: null,
            isValid: false
        }
    }, false);

    const history = useHistory()

    // const inputHandler = useCallback((id, value, isValid) => {
    //     dispatch({type:'INPUT_CHANGE', value: value, isValid: isValid, inputId: id})
    // }, []);
    
    const placeSubmitHandler = async event => {
        event.preventDefault();
        try{
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formState.inputs.address.value);
            formData.append('creator', auth.userId);
            formData.append('image', formState.inputs.image.value);
            // await sendRequest(
            //      `${process.env.REACT_APP_BACKEND_URL}/places`,
            //     'POST',
            //     JSON.stringify({
            //         title: formState.inputs.title.value,
            //         description: formState.inputs.description.value,
            //         address: formState.inputs.address.value,
            //         creator: auth.userId
            //     }),
            //     {'Content-Type' : 'application/json'}
            // );
            await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/places`,
                'POST',
                formData,
                {
                    'Authorization': `Bearer ${auth.token}`
                }
            );
            // console.log(formState.inputs);
            //Redirect user to another page
            history.push('/');
        }catch(err){

        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <form className="place-form" onSubmit={placeSubmitHandler}>
                {isLoading && (
                    <LoadingSpinner asOverlay />
                )}
                <Input 
                    id="title"
                    element="input" 
                    type="text" 
                    label="Title" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid title." 
                    onInput={inputHandler}
                />
                <Input 
                    id="description"
                    element="textarea" 
                    type="text" 
                    label="Description" 
                    validators={[VALIDATOR_MINLENGTH(5)]} 
                    errorText="Please enter a valid description of at least 5 characters." 
                    onInput={inputHandler}
                />
                <Input 
                    id="address"
                    element="input" 
                    type="text" 
                    label="Address" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid address." 
                    onInput={inputHandler}
                />
                <ImageUpload id="image" onInput={inputHandler} errorText="Please provide an image of jpg, png or jpeg" center />
                <Button type="submit" disabled={!formState.isValid}>ADD PLACE</Button>
        </form>
        </React.Fragment>
        
    );
}

export default NewPlace;