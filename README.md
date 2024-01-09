## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## 프리페칭(prefetching) 기능
> 프리페칭은 사용자가 페이지를 클릭하기 전에 미리 해당 페이지의 데이터를 불러오는 기능. 

ex) 웹사이트에서 마우스를 특정 링크 위에 올려 놓았을 때, 아직 클릭하지는 않았지만 사용자가 곧 그 링크를 클릭할 것이라는 예상하에 미리 해당 페이지의 데이터를 불러오는 것

<u>사용자가 마우스를 링크 위에 올려 놓았다는 것이, 곧 해당 링크를 클릭하려고 한다는 강한 신호라고 판단하는 것에 기반. 이런 사용자의 행동 패턴을 활용하여 프리페칭을 수행</u>

이 과정에서 페이지의 정보를 일시적으로 저장하는 캐시(cache) 시스템을 사용하게 되는데, 이 캐시 덕분에 서버에게 매번 새로운 요청을 보내지 않아도 되어 통신 비용을 줄일 수 있음.

하지만, 이런 캐시 시스템은 저장된 정보가 최신 상태를 반영하지 않을 수 있다는 문제점 존재.
ex)  '청구서' 페이지의 정보가 업데이트되었는데도 캐시에는 이전 정보가 그대로 남아있다면, 사용자는 오래된 정보를 보게 될 수 있음.

> 이런 문제를 해결하기 위해 Next.js는 **revalidatePath**라는 함수를 제공. 

이 함수를 사용하면 특정 경로의 캐시를 지우고, 새로운 정보를 얻기 위해 서버에 다시 요청을 보낼 수 있음. 즉, '청구서' 페이지의 **정보가 업데이트**되었을 때 `revalidatePath`를 사용하면, 캐시된 **오래된 정보를 지우고 새로운 정보를 서버에 요청하는 과정을 자동으로 수행**할 수 있음. 이를 통해 사용자는 항상 최신 정보를 볼 수 있게 됨.



## 동적 경로 세그먼트란
> 동적 경로 세그먼트(dynamic route segment)는 웹 어플리케이션의 URL에서 변하는 부분
- Next.js에서는 파일 이름에 **대괄호**를 사용하여 동적 경로 세그먼트를 표현
- ex) 'pages/product/`[id]`.js'라는 파일을 만들면, 'www.mall.com/product/`123`', 'www.mall.com/product/`456`' 등 다양한 상품 페이지를 동일한 템플릿으로 표현 가능. 여기서 `123`,`456`과 같은 `[id]`부분이 동적 경로 세그먼트에 해당


## ESLint 접근성 플러그인
> `eslint-plugin-jsx-ally`: 접근성 문제를 조기에 발견하는 데 도움

ex) 텍스트가 없는 이미지가 있는 경우 -> `alt`, `aria-*` 및 `role` 속성을 잘못 사용하는 경우 등을 경고

```
> package.json
"scripts" {
    // ...
    "lint": "next lint"
}

> npm run lint

// 에러가 없는 경우
✔ No ESLint warnings or errors

// 에러가 있는 경우
./app/ui/invoices/table.tsx
45:25  Warning: Image elements must have an alt prop,
either with meaningful text, or an empty string for decorative images. jsx-a11y/alt-text
```

## 인증 추가  NextAuth.js
- NextAuth.js는 세션 관리, 로그인 및 로그아웃, 기타 인증 측면과 관련된 많은 복잡성을 추상화

```
//  Next.js 14와 호환되는 NextAuth.js 버전을 설치
npm install next-auth@beta

// .env파일에서 생성된 키를 AUTH_SECRET변수에 추가
openssl rand -base64 32

AUTH_SECRET=your-secret-key
```

- 미들웨어: 미들웨어가 인증을 확인할 때까지 보호된 경로가 렌더링을 시작하지 않아 애플리케이션의 보안과 성능이 모두 향상된다는 이점
- 비밀번호 해싱: 해싱은 비밀번호를 무작위로 나타나는 고정 길이의 문자열로 변환하여 사용자 데이터가 노출되더라도 보안 계층을 제공