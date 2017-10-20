import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import firebase from 'firebase/app';
import { userProfile } from '../../models/user-profile';
import { teamProfile } from '../../models/team-profile';

@Injectable()
export class AuthProvider {
  constructor(
    public afAuth: AngularFireAuth,
    public fireStore: AngularFirestore
  ) {}

  loginUser(email: string, password: string): Promise<firebase.User> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  async createAdminUser(
    email: string,
    password: string,
    teamName: string
  ): Promise<firebase.User> {
    const adminUser: firebase.User = await this.afAuth.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    const userProfileCollection: AngularFirestoreCollection<
      userProfile
    > = this.fireStore.collection(`userProfile`);

    userProfileCollection.add({
      id: adminUser.uid,
      email: email,
      teamId: adminUser.uid
    });

    const teamProfile: AngularFirestoreCollection<
      teamProfile
    > = this.fireStore.collection(`teamProfile`);

    teamProfile.add({
      id: adminUser.uid,
      teamAdmin: adminUser.uid,
      teamName: teamName
    });

    return adminUser;
  }

  createRegularUser(email: string): Promise<any> {
    const teamAdmin: firebase.User = this.afAuth.auth.currentUser;
    const userCollection: AngularFirestoreCollection<
      any
    > = this.fireStore.collection(
      `teamProfile/${teamAdmin.uid}/teamMemberList`
    );
    const id: string = this.fireStore.createId();

    const regularUser = {
      id: id,
      email: email,
      teamId: teamAdmin.uid
    };

    return userCollection.add(regularUser);
  }

  resetPassword(email: string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut();
  }
}
