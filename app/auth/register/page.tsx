import RegisterUser from '@/components/page/register'
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getSession();
      if (session?.userId) { // ✅ redirect on the server
        // if(session?.role === "Beneficiary"){
        //   redirect("/auth/client/dashboard");
        // }else{
        //   redirect("/auth/dashboard");
        // }
      }
  return (
    <div>
      <RegisterUser />
    </div>
  )
}
