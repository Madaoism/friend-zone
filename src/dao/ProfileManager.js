import Profile from './Profile'
import firebase from 'firebase';


/* callback (true, null) if dne or (null, Profile) */
export function lookup_profile_by_user_id(user_id, callback){
    let db = firebase.database();
    db.ref('Profile/'+user_id).once('value').then(function(snapshot){

        let content = snapshot.val();
        if (content === null)
            callback(true, null);
        else
            callback(
                null, new Profile(
                    user_id,
                    content.first_name,
                    content.last_name,
                    content.major,
                    content.current_year,
                    content.profile_pic,
                    content.description
                )
            )
    })
}





// /*first time edit the user data
//   no callback fucntion since there should not be duplcate insertion so no error*/
// export function writeUserInfo(user_id, firstname, lastname, major, currentyear, profileURL, mydescription) {
//   firebase.database().ref('Profile/' + user_id).set({
//     first_name: firstname,
//     last_name: lastname,
//     major: major,
//     current_year: currentyear,
//     profile_pic: profileURL,
//     user_description: mydescription
//   });
// }
//
// /*updating userInfo*/
// export function updateUserInfo(user_id, Field, Content){
//
//   var userToUpdate = usersRef.child("user_id");
//   userToUpdate.update({
//     Field: Content
//   });
//
// }
//
// /*delete user info, might be called when deleting a specific user? not likely though*/