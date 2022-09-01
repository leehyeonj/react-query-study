import axios from 'axios';
import { useCallback, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { getUserWithAxios } from './my-api';
// React Query는 내부적으로 queryClient를 사용하여
// 각종 상태를 저장하고, 부가 기능을 제공합니다.
const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
}
function Users() {
   const [userId, setUserId] = useState(5);
  // Query
  // const { isLoading, data, isError, error } = useQuery('users', getUserWithAxios, {
  //   refetchOnWindowFocus: false, // react-query는 사용자가 사용하는 윈도우가 다른 곳을 갔다가 다시 화면으로 돌아오면 이 함수를 재실행합니다. 그 재실행 여부 옵션 입니다.
  //   retry: 0, // 실패시 재호출 몇번 할지
  //   staleTime: 5000,
  // });


  const { status, data, error } = useQuery('users', getUserWithAxios, {
    refetchOnWindowFocus: false, // react-query는 사용자가 사용하는 윈도우가 다른 곳을 갔다가 다시 화면으로 돌아오면 이 함수를 재실행합니다. 그 재실행 여부 옵션 입니다.
    retry: 0, // 실패시 재호출 몇번 할지
    staleTime: 5000,
  });

//add
  const addMutation = useMutation((data) => axios.post('http://localhost:3002/user', data), {
    onMutate: (data) => {
      const previousValue = queryClient.getQueryData('users');
      console.log('previousValue', data);
      queryClient.setQueryData('users', (old) => {
        console.log('old', old);
        return [...old, data];
      });

      return previousValue;
    },
   onSuccess: (result, variables, context) => {
     //성공시 호출
      console.log('성공 메시지:', result);
      console.log('변수', variables);
      console.log('onMutate에서 넘어온 값', context);
      setUserId(userId + 1);
    },
      onError: e => {
      // 실패시 호출 (401, 404 같은 error가 아니라 정말 api 호출이 실패한 경우만 호출됩니다.)
      // 강제로 에러 발생시키려면 api단에서 throw Error 날립니다. (참조: https://react-query.tanstack.com/guides/query-functions#usage-with-fetch-and-other-clients-that-do-not-throw-by-default)
      console.log(e.message);
    }
  });

  const editMutation = useMutation((id) => axios.put(`http://localhost:3002/user/${id}`, {
    name : 'adfadf'
  }), {
    onMutate: (data) => {
       const previousValue = queryClient.getQueryData('users');
      console.log('previousValue', previousValue);
      // queryClient.setQueryData('users', (old) => {
      //   console.log('old', old);
      //   return [...old, data];
      // });

      // return previousValue;
    },
   onSuccess: (result, variables, context) => {
     //성공시 호출
      console.log('성공 메시지:', context);
    },
      onError: e => {
      console.log(e.message);
    }
  });


  const handleSubmit = useCallback(
    (data) => {
      addMutation.mutate(data);
    },
    [addMutation],
  )

  const handleEditUser = useCallback(
    (id) => {
      editMutation.mutate(id);
    },
    [editMutation]
  )


  if (status === 'loading') {
    return <span>Loading...</span>;
  }

  if (status === 'error') {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <ul>
      {data.map(user => (
        <div key={user.id}>
          <li >{user.name}</li>
          <button onClick={() => handleEditUser(user.id)}>수정하기</button>
        </div>
      ))}
    </ul>
    <button onClick={() => handleSubmit({id: userId, name: `test${userId}`})}>유저 추가</button>
    </div>
  );
}
export default App;