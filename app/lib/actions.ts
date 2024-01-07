'use server';

import { z } from 'zod'; // zod 라이브러리: 스키마 선언 및 유효성 검사 라이브러리.
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
// 페이지의 정보가 업데이트되었을 때 revalidatePath를 사용하면,
// 캐시된 오래된 정보를 지우고 새로운 정보를 서버에 요청하는 과정을 자동으로 수행 가능
// 이를 통해 사용자는 항상 최신 정보를 볼 수 있게 됨.
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
// coerce: 타입 강제
// enum: 특정한 값'만' 가질 수 있게 설정 가능

// 스키마 생성
const CreateInvoice = FormSchema.omit({ id: true, date: true });
// omit: 특정 필드를 제외한 새로운 스키마 생성. 필드는 key, 값에는 true or false. true일 경우 해당 필드는 스키마에서 제외됨.

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    // parse: 입력된 데이터가 해당 스키마에 부합하는지 검증하는 역할. 부합하면 {}의 데이터 반환. 부합하지 않으면 에러 발생.
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  // await 키워드는 Promise를 기다리는 역할
  // sql은 SQL 쿼리를 실행하는 함수
  // 'invoices' 테이블에 'customer_id', 'amount', 'status', 'date'라는 4개의 필드에 데이터를 넣겠다는 의미
  // VALUES (${customerId}, ${amountInCents}, ${status}, ${date}): 각각의 필드에 들어갈 값을 지정. 이 변수들의 값이 SQL 쿼리에 삽입

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 스키마 수정
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 스키마 삭제
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}