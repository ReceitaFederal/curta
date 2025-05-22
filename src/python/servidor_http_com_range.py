import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote

PASTA_VIDEOS = '.'  # mesma pasta do script

class RangeRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        caminho = unquote(self.path[1:])  # remove "/"

        

        if self.path == '/':
            # Serve interface HTML
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self.gerar_html().encode('utf-8'))
            return

        arquivo = os.path.join(PASTA_VIDEOS, caminho)

        if not os.path.isfile(arquivo):
            self.send_error(404, "Arquivo não encontrado")
            return

        tamanho = os.path.getsize(arquivo)
        range_header = self.headers.get('Range', None)

        if range_header:
            # Ex: bytes=1000-2000
            bytes_range = range_header.strip().split('=')[-1]
            start, end = bytes_range.split('-')
            start = int(start)
            end = int(end) if end else tamanho - 1
            end = min(end, tamanho - 1)

            self.send_response(206)
            self.send_header('Content-type', 'video/mp4')
            self.send_header('Content-Range', f'bytes {start}-{end}/{tamanho}')
            self.send_header('Content-Length', str(end - start + 1))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()

            with open(arquivo, 'rb') as f:
                f.seek(start)
                self.wfile.write(f.read(end - start + 1))
        else:
            self.send_response(200)
            self.send_header('Content-type', 'video/mp4')
            self.send_header('Content-Length', str(tamanho))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()

            with open(arquivo, 'rb') as f:
                self.wfile.write(f.read())

    def gerar_html(self):
        arquivos = [f for f in os.listdir(PASTA_VIDEOS) if f.endswith('.mp4')]
        opcoes = '\n'.join([f'<option value="{f}">{f}</option>' for f in arquivos])
        return f'''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reprodutor de Trechos</title>
</head>
<body>
  <h1>Escolha um vídeo e um trecho</h1>
  <label>Vídeo:
    <select id="videoSelecionado">
      {opcoes}
    </select>
  </label>
  <br>
  <label>Início (segundos): <input type="number" id="inicio" value="0"></label>
  <label>Fim (segundos): <input type="number" id="fim" value="30"></label>
  <br>
  <button onclick="tocarTrecho()">Tocar Trecho</button>
  <br><br>
  <video id="player" controls width="640"></video>

  <script>
    function tocarTrecho() {{
      const video = document.getElementById('videoSelecionado').value;
      const inicio = document.getElementById('inicio').value;
      const fim = document.getElementById('fim').value;
      const player = document.getElementById('player');

      player.src = video + '#t=' + inicio + ',' + fim;
      player.load();
      player.play();
    }}
  </script>
</body>
</html>
'''

if __name__ == '__main__':
    print("Servidor rodando em http://localhost:8000/")
    print("Coloque seus vídeos .mp4 na mesma pasta que este script.")
    httpd = HTTPServer(('0.0.0.0', 8000), RangeRequestHandler)
    httpd.serve_forever()
