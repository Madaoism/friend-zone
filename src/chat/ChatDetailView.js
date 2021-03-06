import React, {Component} from 'react';
import {
    get_chat_participant_by_id, get_chat_pic_by_id, get_chat_title_by_id,
    update_session_pic, update_session_title
} from "./ChatSessionManager";
import {get_friend_profiles} from "../api/StaticData";
import {lookup_profile_by_user_id} from "../dao/ProfileManager";
import default_group_chat_pic from '../image/DefaultGroupChatPic.jpg'
import firebase from 'firebase';
import default_profile_pic from '../image/DefaultProfilePic.jpg'

import './ChatDetailView.css'

class ChatDetailView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            session_id: props.session_id,
            chat_title: "",
            session_pic: default_group_chat_pic,
            new_chat_title: "",
            participant_ids: [],
            participant_profile_obj: {}
        }
    }

    componentWillMount() {

        get_chat_title_by_id(this.state.session_id, (err, title) => {
            this.setState({
                chat_title: title,
                new_chat_title: title
            });
        });

        get_chat_pic_by_id(this.state.session_id, (err, pic_url) => {
            if (!err)
                this.setState({session_pic: pic_url});
        });

        get_chat_participant_by_id(this.state.session_id, (err, session_participants) => {

            var participant_list = Object.keys(session_participants);

            this.setState({participant_ids: participant_list}, () => {

                var friend_profiles = get_friend_profiles();
                var aggregated_participant_profiles = {};

                this.state.participant_ids.forEach((participant_id) => {

                    /*if participants profile is in friend profiles i.e. already friends*/
                    if (friend_profiles[participant_id] !== undefined) {
                        aggregated_participant_profiles[participant_id] = friend_profiles[participant_id];
                        this.setState({participant_profile_obj: aggregated_participant_profiles});
                    }
                    /*else lookup this user*/
                    else {
                        lookup_profile_by_user_id(participant_id, (err, profile) => {
                            if (!err) {
                                aggregated_participant_profiles[participant_id] = profile;
                                this.setState({participant_profile_obj: aggregated_participant_profiles});
                            }
                        })
                    }

                })
                /*end of for each participant id lookup profile*/
            });
        })
    }

    update_chat_pic(e) {
        e.preventDefault();
        var file = e.target.files[0];

        var storage_ref = firebase.storage().ref('chat_session_pic/' + this.state.session_id);
        var upload_task = storage_ref.put(file);

        /*only pass in a complete() function*/
        upload_task.on('state_changed', null, null, () => {
            var image_url = upload_task.snapshot.downloadURL;
            this.setState({session_pic: image_url});

            update_session_pic(this.state.session_id, image_url);
        })

    }

    change_title() {
        if (this.state.new_chat_title.trim().length === 0) return;

        update_session_title(this.state.session_id, this.state.new_chat_title);
        this.setState({
            chat_title: this.state.new_chat_title,
        })
    }


    render() {


        return (
            <div className='chat-detail-container' align='center'>
                <br/>

                <div className='chat-pic-container'>
                    <img className='chat-pic' src={this.state.session_pic} alt=""/>
                </div>
                <br/>

                <div>
                    {this.state.chat_title}
                </div>

                <div className='chat-pic-upload-button-container'>
                    <label htmlFor="chat-pic-upload" className='chat-edit-button'>
                        Upload image &nbsp;
                        <svg viewBox="0 0 32 32" width="20" height="20"
                             fill="none" stroke="#2f5597"
                             strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M20 24 L12 16 2 26 2 2 30 2 30 24 M16 20 L22 14 30 22 30 30 2 30 2 24"/>
                            <circle cx="10" cy="9" r="3"/>
                        </svg>
                    </label>
                    <input id='chat-pic-upload' type='file' name='New Chat Picture' accept='image/*'
                           onChange={e => this.update_chat_pic(e)}/>

                    &nbsp; &nbsp;

                    <label className='chat-edit-button' onClick={this.change_title.bind(this)}
                    > Change Title &nbsp;</label>
                    <input type="text" placeholder='Non-blank title' className='new-chat-title-input-box'
                           value={this.state.new_chat_title}
                           onChange={e => this.setState({new_chat_title: e.target.value})}/>
                    <button className='chat-edit-button' onClick={this.change_title.bind(this)}>
                        <svg viewBox="0 0 32 32" width="20" height="20"
                             fill="none" stroke="#2f5597"
                             strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z"/>
                        </svg>
                    </button>
                </div>
                <br/>

                <div>
                    Participants &nbsp; &nbsp;
                    {/*<button className='chat-edit-button'>*/}
                    {/*<svg viewBox="0 0 32 32" width="20" height="20"*/}
                    {/*fill="none" stroke="#2f5597"*/}
                    {/*strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">*/}
                    {/*<path d="M16 2 L16 30 M2 16 L30 16" />*/}
                    {/*</svg>*/}
                    {/*</button>*/}
                </div>


                <table className='participant-entry-container'>
                    <tbody>
                    {
                        Object.keys(this.state.participant_profile_obj).map((participant_id, index) => {
                            return (
                                <tr key={'participant-' + index}>
                                    <td>
                                        <div className='participant-icon-container'>
                                            <img className='participant-icon'
                                                 src={this.state.participant_profile_obj[participant_id].profile_pic || default_profile_pic}
                                                 alt=""/>
                                        </div>
                                    </td>

                                    <td>
                                        <div
                                            className='participant-name'> {this.state.participant_profile_obj[participant_id].first_name + " " +
                                        this.state.participant_profile_obj[participant_id].last_name} </div>
                                    </td>
                                </tr>
                            )
                        })
                    }

                    </tbody>
                </table>


                <br/><br/>
                {/*<pre>{JSON.stringify(this.state, null, 2)}</pre>*/}
            </div>
        )
    }

}

export default ChatDetailView;