import React, {Component} from 'react';
import NavBar from './MainLayout'

class UserSchedule extends Component{

    constructor(props){
        super(props);
        this.title = "UserSchedule.js";
    }


    render(){
        return(

            <div align={'center'}>

                <img src={"https://res.cloudinary.com/teepublic/image/private/s--8-dGDDZg--/t_Preview/b_rgb:ffffff,c_limit,f_jpg,h_630,q_90,w_630/v1470902298/production/designs/627022_1.jpg"}
                     alt={""} width={"300"}/>
                <h1>{this.title}</h1>

                <NavBar tab="schedule" />
                <h4>いつでもダラダラしたいなぁ...</h4>


            </div>

        )
    }
}

export default UserSchedule;