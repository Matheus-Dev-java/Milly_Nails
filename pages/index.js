export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #fdf2f8, white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#db2777', fontSize: '36px', marginBottom: '20px' }}>
          ✨ Milly Nails ✨
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Sistema em construção...
        </p>
      </div>
    </div>
  );
}
