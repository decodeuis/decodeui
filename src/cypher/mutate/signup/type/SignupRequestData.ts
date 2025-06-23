export interface SignupRequestData {
  email: string;
  isSubDomainCreation?: boolean;
  password: string;
  subDomain: string;
  username: string;
  uuid?: string;
}
