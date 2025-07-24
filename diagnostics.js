<!DOCTYPE html>
<html lang="he">
<head>
  <meta charset="UTF-8">
  <title>ISR RS Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; }
    #diagnosticBtn { margin: 1em; padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .diagnostic-popup li { margin-bottom: 4px; font-size: 15px; font-weight: 500; }
    .diagnostic-popup li.ok { color: green; }
    .diagnostic-popup li.warn { color: orange; }
    .diagnostic-popup li.err { color: red; }
    #statusIndicator { display: inline-block; margin-right: 10px; font-size: 1.4em; vertical-align: middle; }
  </style>
</head>
<body>
  <h1><span id="statusIndicator">⚪</span>מערכת ISR RS Register</h1>
  <button id="diagnosticBtn">🧪 בדוק תקינות</button>

  <script>
  function runDiagnostics() {
    const results = [];
    let statusIcon = '⚪';
    let hasError = false;

    const token = localStorage.getItem('oauth_token');
    results.push({ msg: token ? "✅ נמצא טוקן גישה" : "❌ לא נמצא טוקן גישה (access_token)", type: token ? 'ok' : 'err' });
    if (!token) hasError = true;

    const expiry = parseInt(localStorage.getItem('oauth_expiry') || '0');
    if (!expiry) {
      results.push({ msg: "⚠️ תאריך תפוגה חסר בטוקן", type: 'warn' });
    } else if (Date.now() > expiry) {
      results.push({ msg: "❌ הטוקן פג תוקף – נדרש רענון", type: 'err' });
      hasError = true;
    } else {
      const left = Math.floor((expiry - Date.now()) / 1000);
      results.push({ msg: `✅ הטוקן בתוקף ל-${left} שניות נוספות`, type: 'ok' });
    }

    const refresh = localStorage.getItem('oauth_refresh');
    results.push({ msg: refresh ? "✅ refresh_token קיים לשימוש ברענון עתידי" : "⚠️ חסר refresh_token – בדוק ש-BACKEND של ההרשאות כולל access_type=offline", type: refresh ? 'ok' : 'warn' });

    const scopes = localStorage.getItem('oauth_scopes') || '';
    results.push({ msg: scopes.includes('drive') ? "✅ הרשאות Drive קיימות" : "❌ חסרות הרשאות Drive (scope='drive.readonly')", type: scopes.includes('drive') ? 'ok' : 'err' });
    if (!scopes.includes('drive')) hasError = true;

    const statusElem = document.getElementById('statusIndicator');
    statusElem.textContent = hasError ? '🔴' : '🟢';

    displayDiagnosticResults(results);
  }

  function displayDiagnosticResults(items) {
    const box = document.createElement('div');
    box.className = 'diagnostic-popup';
    box.style.position = 'fixed';
    box.style.top = '20px';
    box.style.right = '20px';
    box.style.background = '#fff';
    box.style.border = '2px solid #333';
    box.style.padding = '15px';
    box.style.maxWidth = '350px';
    box.style.zIndex = '9999';
    box.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    box.innerHTML = '<b>תוצאות בדיקת המערכת:</b><ul>' +
      items.map(i => `<li class="${i.type}">${i.msg}</li>`).join('') + '</ul>';

    const close = document.createElement('button');
    close.textContent = '✖';
    close.style.position = 'absolute';
    close.style.top = '5px';
    close.style.left = '8px';
    close.onclick = () => box.remove();
    box.appendChild(close);
    document.body.appendChild(box);
  }

  document.getElementById('diagnosticBtn').addEventListener('click', runDiagnostics);

  // הפעלת הבדיקה אוטומטית בעת טעינת העמוד
  window.addEventListener('load', runDiagnostics);
  </script>
</body>
</html>
