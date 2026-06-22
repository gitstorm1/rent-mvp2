import { login, signup } from './actions';

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Tenant Bill Automator
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to manage your properties and tenants
          </p>
        </div>
        <form className="mt-8 space-y-6" action={login}>
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {
            /*searchParams?.message && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                            {searchParams.message}
                        </div>
                    )*/
            searchParams?.message && (
              <div
                className={`p-4 text-sm rounded-md border ${
                  searchParams.message.includes('verify')
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' // Green for success/verify
                    : 'bg-red-50 text-red-700 border-red-100' // Red for errors
                }`}
              >
                {searchParams.message}
              </div>
            )
          }

          <div className="flex gap-4">
            <button
              formAction={login}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </button>
            <button
              formAction={signup}
              className="group relative w-full flex justify-center py-2 px-4 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
