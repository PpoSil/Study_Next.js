'use server';

import { z } from 'zod'; // zod 라이브러리: 스키마 선언 및 유효성 검사 라이브러리.
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
// 페이지의 정보가 업데이트되었을 때 revalidatePath를 사용하면,
// 캐시된 오래된 정보를 지우고 새로운 정보를 서버에 요청하는 과정을 자동으로 수행 가능
// 이를 통해 사용자는 항상 최신 정보를 볼 수 있게 됨.
import { redirect } from 'next/navigation';
// 인증 로직과 로그인 양식 연결
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
// coerce: 타입 강제
// enum: 특정한 값'만' 가질 수 있게 설정 가능

// 스키마 생성
const CreateInvoice = FormSchema.omit({ id: true, date: true });
// omit: 특정 필드를 제외한 새로운 스키마 생성. 필드는 key, 값에는 true or false. true일 경우 해당 필드는 스키마에서 제외됨.

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // parse: 입력된 데이터가 해당 스키마에 부합하는지 검증하는 역할. 부합하면 {}의 데이터 반환. 부합하지 않으면 에러 발생.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date) 
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    // await 키워드는 Promise를 기다리는 역할
    // sql은 SQL 쿼리를 실행하는 함수
    // 'invoices' 테이블에 'customer_id', 'amount', 'status', 'date'라는 4개의 필드에 데이터를 넣겠다는 의미
    // VALUES (${customerId}, ${amountInCents}, ${status}, ${date}): 각각의 필드에 들어갈 값을 지정. 이 변수들의 값이 SQL 쿼리에 삽입
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 스키마 수정
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 스키마 삭제
export async function deleteInvoice(id: string) {
  // 에러 뜨게 하려면 밑에 주석 제거
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// 인증
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
