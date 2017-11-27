import React, {Component} from 'react';
import Profile from '../../dao/Profile'
import {lookup_profile_by_user_id} from '../../dao/ProfileManager'
import firebase from 'firebase';
import PageTitle from "../components/PageTitle";
import './EditProfile.css'

class EditProfile extends Component {

    constructor(props) {
        super(props);
        let user_id = firebase.auth().currentUser.uid;
        this.title = "EditProfile.js";
        this.profile_obj = new Profile(user_id, "", "", "", "", "", "");

        this.state = {
            user_id: user_id,
            message: "",
            first_name: "",
            last_name: "",
            major: "",
            current_year: "",
            profile_pic: "",
            description: "",
            upload_status: "",
            newPassword: "",
            repeatPassword: "",
            password_action_msg: ""
        };


        this.initialized = false;
    }

    initialize() {
        lookup_profile_by_user_id(this.state.user_id, function (err, profile) {
            this.initialized = true;
            if (err) {
                this.setState({message: "Profile not found for this user, creating new."})
            } else {
                this.profile_obj = profile;
                this.setState({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    major: profile.major,
                    current_year: profile.current_year,
                    profile_pic: profile.profile_pic,
                    description: profile.description
                });
            }
        }.bind(this))
    }

    handle_update() {
        this.profile_obj.first_name = this.state.first_name;
        this.profile_obj.last_name = this.state.last_name;
        this.profile_obj.major = this.state.major;
        this.profile_obj.current_year = this.state.current_year;
        this.profile_obj.first_name = this.state.first_name;
        this.profile_obj.profile_pic = this.state.profile_pic;
        this.profile_obj.description = this.state.description;
        this.profile_obj.push().catch(function (error) {
            alert(error);
        });
    }

    handle_update_password() {
        var user = firebase.auth().currentUser;

        // Check password strength
        let uppercase_count = 0;
        let lowercase_count = 0;
        let numeric = 0;
        let total = 0;
        let password = this.state.newPassword;

        for (let i = 0; i < password.length; i++) {
            if (password[i] >= 'A' && password[i] <= 'Z') {
                uppercase_count++;
            }
            else if (password[i] >= 'a' && password[i] <= 'z') {
                lowercase_count++;
            }
            else if (password[i] >= '0' && password[i] <= '9') {
                numeric++;
            }
            total++;
        }

        var password_msg;

        // Check if they are valid passwords or not
        if (uppercase_count < 1) {
            password_msg = "There must be at least one uppercase letter in the password";
        }
        else if (lowercase_count < 1) {
            password_msg = "There must be at least one lowercase letter in the password";
        }
        else if (numeric < 1) {
            password_msg = "There must be at least one number in the password";
        }
        else if (total < 8) {
            password_msg = "The password is not long enough";
        }
        else if (password !== this.state.repeatPassword) {
            password_msg = "The passwords entered do not match each other";
        }

        else {

            user.updatePassword(password).then(function () {
                password_msg = "Password Changed Successfully";
                this.setState({password_action_msg: password_msg, newPassword: "", repeatPassword: ""});
            }.bind(this)).catch(function (error) {
                password_msg = "An error has occurred, please try again later";
                this.setState({password_action_msg: password_msg, newPassword: "", repeatPassword: ""});
            }.bind(this));
        }
        this.setState({password_action_msg: password_msg, newPassword: "", repeatPassword: ""});
    }

    upload_image(e) {
        e.preventDefault();
        var file = e.target.files[0];

        /*store the file as: /profile_pic/user_id */

        var storageRef = firebase.storage().ref('profile_pic/' + firebase.auth().currentUser.uid);
        var uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',

            function in_progress(snapshot) {
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.setState({upload_status: percentage})
            }.bind(this),

            function error(error) {
                this.setState({upload_status: "Upload failed: " + error.message})
            }.bind(this),

            function complete() {
                var downloadURL = uploadTask.snapshot.downloadURL;
                this.setState({
                    profile_pic: downloadURL,
                    upload_status: "Upload Complete"
                }, () => {
                    /*after upload finish and setting url to this.state, push the profile*/
                    this.handle_update();
                });
            }.bind(this));
    }

    render() {
        if (!this.initialized) this.initialize();

        return (

            <div align={'center'}>
                <PageTitle title={'Edit my profile'}/>

                <br/>
                <div className='profile-pic-container'>
                    <img src={this.state.profile_pic} alt="" className='profile-pic'/>
                </div>
                <br/>

                <div>
                    <label htmlFor="chat-pic-upload" className='chat-edit-button'>
                        Upload image &nbsp;
                        <svg viewBox="0 0 32 32" width="20" height="20"
                             fill="none" stroke="#2f5597"
                             strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M20 24 L12 16 2 26 2 2 30 2 30 24 M16 20 L22 14 30 22 30 30 2 30 2 24"/>
                            <circle cx="10" cy="9" r="3"/>
                        </svg>
                    </label>
                    <input id='chat-pic-upload' type='file' name='New Profile Picture' accept='image/*'
                           onChange={e => this.upload_image(e)}/>
                </div>
                <br/>

                <table className={'edit-profile-table'}>
                    <tbody>
                    <tr>
                        <td>First Name</td>
                        <td>
                            <input type="text" value={this.state.first_name}
                                   onChange={e => this.setState({first_name: e.target.value})}/>
                        </td>
                    </tr>

                    <tr>
                        <td>Last Name</td>
                        <td>
                            <input type="text" value={this.state.last_name}
                                   onChange={e => this.setState({last_name: e.target.value})}/>
                        </td>
                    </tr>

                    <tr>
                        <td>Major</td>
                        <td>
                            <input type="text" value={this.state.major}
                                   onChange={e => this.setState({major: e.target.value})}/>
                        </td>
                    </tr>

                    <tr>
                        <td>Current Year</td>
                        <td>
                            <select name="current-year" id="current-year"
                                    value={this.state.current_year}
                                    onChange={e => {
                                        this.setState({current_year: e.target.value})
                                    }}
                            >
                                <option value="Other">..</option>
                                <option value="Freshman">Freshman</option>
                                <option value="Sophomore">Sophomore</option>
                                <option value="Junior">Junior</option>
                                <option value="Senior">Senior</option>
                                <option value="Other">Other</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>Description</td>
                        <td>
                            <input type="text" value={this.state.description}
                                   onChange={e => this.setState({description: e.target.value})}/>

                        </td>
                    </tr>

                    </tbody>
                </table>

                <button className={'edit-profile-button'}
                    onClick={this.handle_update.bind(this)}> Update Profile</button>
                <br/>


                <br/>
                <br/>
                <PageTitle title={'Change password'}/>
                <div className={'edit-profile-subtitle'}>
                    (Password must contain uppercase, lowercase letters, number, and be at least 8 chars long)
                </div>
                <br/>
                <table className={'edit-profile-table'}>
                    <tbody>
                    <tr>
                        <td>New password</td>
                        <td>
                            <input type="text" value={this.state.newPassword}
                                   onChange={e => this.setState({newPassword: e.target.value})}/>
                        </td>
                    </tr>
                    <tr>
                        <td>Confirm password</td>
                        <td>
                            <input type="text" value={this.state.repeatPassword}
                                   onChange={e => this.setState({repeatPassword: e.target.value})}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div> {this.state.password_action_msg} </div>
                <button className={'edit-profile-button'}
                        onClick={this.handle_update_password.bind(this)}>Update Password</button>

                <br/>
                <br/>
                {/*state:*/}
                {/*<pre>{JSON.stringify(this.state, null, 2)}</pre>*/}

            </div>

        )
    }
}

export default EditProfile;