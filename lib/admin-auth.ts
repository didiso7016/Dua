import {currentAccount} from './account-auth';
export async function isAdmin(){return !!await currentAccount()}
