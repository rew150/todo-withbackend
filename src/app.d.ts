// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	namespace App {
		// interface Locals {}
		// interface Platform {}
		// interface PrivateEnv {}
		interface PublicEnv {
			PUB_API_PATH: string?;
		}
		// interface Session {}
		// interface Stuff {}
	}
}
