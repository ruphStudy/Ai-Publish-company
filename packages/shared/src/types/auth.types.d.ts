export interface JwtPrincipal {
    sub: string;
    email?: string;
    roles?: string[];
}
