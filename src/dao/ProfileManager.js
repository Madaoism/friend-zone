import Profile from './Profile';
import firebase from 'firebase';
//import Event from './Event'


/**
 * Return the user profile by user id.
 * callback (true, null) if does not exist (dne),
 * otherwise, callback (null, Profile) */
export function lookup_profile_by_user_id(user_id, callback){
    let db = firebase.database();
    db.ref('Profile/'+user_id).once('value').then(function(snapshot){

        let content = snapshot.val();
        if (content === null)
            callback(true, null);
        else{
            let profile = new Profile(
                user_id,
                content.first_name,
                content.last_name,
                content.major,
                content.current_year,
                content.profile_pic,
                content.description
            );
            profile.enrolled_courses = content.enrolled_courses ||{};
            profile.friend_list = content.friend_list ||{};
            profile.outgoing_request = content.outgoing_request ||{};
            profile.incoming_request = content.incoming_request ||{};
            profile.upcoming_events = content.upcoming_events ||{};
            callback(null, profile);
        }
    })
}


export function add_course_to_profile(user_id, course_id){
    lookup_profile_by_user_id(user_id, function(err, profile){
        if (!err) {
            profile.enrolled_courses[course_id] = true;
            profile.push();
        }
    })
}

export function remove_course_from_profile( user_id, course_id ){
    lookup_profile_by_user_id( user_id, function( err,profile){
        if(!err){
            profile.enrolled_courses[course_id] = null;
            profile.push();
        }
    })
}

export function add_event_to_profile(user_id, event_name, event_day , start_time, end_time, event_location){
    lookup_profile_by_user_id( user_id, function(err, profile){
        if(!err){
            // This will become the event_id:
            //      event_name@event_day start_time-end_time
            /*profile.upcoming_events[event_name+"@"+event_day+" "+start_time+"-"+end_time] =
                new Event( event_name, event_day, start_time, end_time, event_location);
            profile.push();*/

            // We should be using this instead
            let db = firebase.database();

            db.ref('Profile/'+user_id).child('upcoming_events').push().set({
                day: event_day,
                end_time: end_time,
                event_name:event_name,
                location:event_location,
                start_time: start_time
            });
        }
    })
}

export function remove_event_from_profile(user_id, event_id){
    lookup_profile_by_user_id( user_id, function(err, profile){
        if(!err){
            profile.upcoming_events[event_id] = null;
            profile.push();
        }
    })
}


export function create_friend_request(from_id, to_id) {

    lookup_profile_by_user_id(from_id, (err, from_profile)=>{
        from_profile.outgoing_request[to_id] = true;
        from_profile.push();
    });
    lookup_profile_by_user_id(to_id, (err, to_profile)=>{
        to_profile.incoming_request[from_id] = true;
        to_profile.push();
    })
}

export function accept_friend_request(from_id, to_id){

    lookup_profile_by_user_id(to_id, (err, to_object)=>{
        to_object.incoming_request[from_id] = null;
        to_object.friend_list[from_id] = true;
        to_object.push();
    });
    lookup_profile_by_user_id(from_id, (err, from_object)=>{
        from_object.outgoing_request[to_id] = null;
        from_object.friend_list[to_id] = true;
        from_object.push();
    })
}

export function decline_friend_request(from_id, to_id){

    lookup_profile_by_user_id(to_id, (err, to_object)=>{
        to_object.incoming_request[from_id] = null;
        to_object.push();
    });
    lookup_profile_by_user_id(from_id, (err, from_object)=>{
        from_object.outgoing_request[to_id] = null;
        from_object.push();
    })
}


export function delete_friend(self_id, friend_id, callback){

    lookup_profile_by_user_id(self_id, (err, data) =>{

        // A friend's set to false, meaning he is blocked
        delete data.friend_list[friend_id];
        data.push().then(callback(err,data));
    });

    lookup_profile_by_user_id(friend_id, (err, data) =>{

        // A friend's set to false, meaning he is blocked
        delete data.friend_list[self_id];
        data.push();
    });

}

export function block_friend(self_id, friend_id, callback) {
    lookup_profile_by_user_id(self_id, (err, data) =>{

        // A friend's set to false, meaning he is blocked
        data.friend_list[friend_id] = false;
        data.push().then(callback(err,data));
    });
}

export function unblock_friend(self_id, friend_id, callback) {
    lookup_profile_by_user_id(self_id, (err, data) =>{

        // A friend's set to false, meaning he is blocked
        data.friend_list[friend_id] = true;
        data.push().then(callback(err,data));
    });

}