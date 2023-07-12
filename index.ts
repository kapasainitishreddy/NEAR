//class is used to export the class to the outside world like smart contract
import { storage,Context, logging } from 'near-sdk-as';
export class Greeting {
    getGreeting(accountId: string): string | null
    { // return type is string or null
        logging.log("getGreeting method called with accountId: " + accountId);//logging is used to log the message in the console like console.log
        return storage.get<string>(accountId, "accountid not found"); // get the value from storage and return it to the caller 
         // storage.get<type>(key, default value)
        
    }
 //if the function doesnt rerurn anything then the return type is void   
    setGreeting(greeting: string): void {
        logging.log("setGreeting method called with greeting: " + greeting);
        logging.log("setGreeting method called by: " + Context.sender);
    storage.set(Context.sender, greeting); // set the value in storage
     // storage.set(key, value) context.sender is the account id of the caller
    //Context is used to get the information about the caller
        
    }

}