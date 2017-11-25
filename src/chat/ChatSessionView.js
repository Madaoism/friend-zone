import React, {Component} from 'react';
import firebase from 'firebase';
import {add_message} from "./ChatSessionManager";
import {lookup_profile_by_user_id} from "../dao/ProfileManager";
import ReactDOM from 'react-dom';

import './ChatSessionView.css'
import {read_portal} from "./ChatPortalManager";
import {get_friend_profiles, get_self_profile} from "../api/StaticData";

import default_profile_pic from "../image/DefaultProfilePic.jpg"
import OtherProfile from "../view/profile/FriendProfile";

class ChatSessionView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            session_id: props.session_id,
            messages: {},
            title: "",
            input: "",
            my_name: "",
            show_load_full_button: true
        }
    }

    componentWillMount() {
        var ref = firebase.database().ref('ChatSession/' + this.state.session_id);

        ref.child('message').limitToLast(15).on('child_added', (snapshot) => {
            var messages = this.state.messages;
            messages[snapshot.val().time] = snapshot.val();
            this.setState({messages: messages}, () => {
                this.scroll_message_container_to_bottom();
            });

        });

        lookup_profile_by_user_id(firebase.auth().currentUser.uid, (err, profile_obj) => {
            this.setState({my_name: profile_obj.first_name + " " + profile_obj.last_name})
        })
    }

    load_full_history() {
        var ref = firebase.database().ref('ChatSession/' + this.state.session_id);
        ref.child('message').once('value').then((snapshot) => {
            this.setState({
                messages: snapshot.val(),
                show_load_full_button: false
            });
        })
    }

    scroll_message_container_to_bottom() {
        var message_container = document.getElementById("message-container");
        if (message_container) message_container.scrollTop = message_container.scrollHeight;
    }

    goto_other_profile(user_id) {
        ReactDOM.render(<OtherProfile user_id={user_id}/>, document.getElementById('main-layout'));
    }

    handle_input_key_press(e) {
        if (e.key === 'Enter') e.preventDefault();
        if (e.key === 'Enter' && this.state.input.length > 0) {
            this.send_message();
            read_portal(firebase.auth().currentUser.uid, this.state.session_id);
        }
    }

    send_message() {
        add_message(this.state.session_id, this.state.my_name, this.state.input);
        this.setState({input: ""})
    }

    render() {
        var friend_profiles = get_friend_profiles();
        var prev_sender = "";
        /*keep track of who sent the previous message, and not show icon and name on the next one */

        var load_full_button = "";
        if (this.state.show_load_full_button)
            load_full_button = (
                <div align='center'>
                    <button className='load-full-history-button'
                            onClick={this.load_full_history.bind(this)}>
                        Load full chat history
                    </button>
                </div>
            );

        return (
            <div>


                <div className="message_container" id="message-container">

                    {load_full_button}


                    {
                        Object.keys(this.state.messages).map((message_id, index) => {

                            var message = this.state.messages[message_id];

                            /* self message */
                            if (message.sender_id === firebase.auth().currentUser.uid) {
                                prev_sender = message.sender_id;
                                return (
                                    <div key={'message-' + index}
                                         className="message_row">
                                        <div className="bubble_right">{message.msg}</div>
                                    </div>
                                )
                            }

                            /*message from others*/
                            else {

                                /*filter out blocked sender*/
                                if (get_self_profile().friend_list[message.sender_id] === false)
                                    return (<div> </div>)


                                /*get the profile pic*/
                                var sender_profile = friend_profiles[message.sender_id] || {};
                                var profile_pic = sender_profile.profile_pic;

                                if (profile_pic === null || profile_pic === "" || profile_pic === undefined)
                                    profile_pic = default_profile_pic;


                                var chat_icon_div = (
                                    <div className="sender_icon_container" onClick={() => {
                                        this.goto_other_profile(message.sender_id)
                                    }}>
                                        <img className="sender_icon" src={profile_pic} alt="Sender"/>
                                    </div>);


                                var sender_name_div = (<div className="sender"> {message.sender}</div>);

                                /*hide profile pic and sender name if equal to last messages sender*/
                                if (message.sender_id === prev_sender) {
                                    chat_icon_div = (<div className="sender_icon_container_invisible"></div>);
                                    sender_name_div = (<div></div>);
                                }

                                prev_sender = message.sender_id;

                                return (
                                    <div key={'message-' + index}
                                         className="message_row">

                                        {chat_icon_div}

                                        <div className="sender_message_container">
                                            {sender_name_div}
                                            <div className="bubble_left">{message.msg}</div>
                                        </div>

                                    </div>
                                )
                            }

                        })
                    }

                    <div className="message_container_bottom_padding"></div>

                </div>


                <div className="input_holder">


                    <textarea type="text" className="message_input"
                              value={this.state.input}
                              placeholder="Your message here, return to send"
                              onChange={(e) => {
                                  this.setState({input: e.target.value})
                              }}
                              onKeyPress={this.handle_input_key_press.bind(this)}
                    />
                </div>

            </div>
        )
    }


}

export default ChatSessionView;