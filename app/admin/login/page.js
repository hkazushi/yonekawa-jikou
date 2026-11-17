import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-box">
        <p className="logo">株式会社米川自工</p>
        <h1>管理画面ログイン</h1>
        <LoginForm />
      </div>
    </main>
  );
}
