#!/bin/bash
# GitHub Actions deploy anahtarinin calistirabildigi TEK komut.
#
# Sunucuda /root/deploy-gate.sh olarak durur; /root/.ssh/authorized_keys icinde
# deploy anahtari `command="/root/deploy-gate.sh",restrict ...` ile buna baglidir.
# Anahtar sizsa bile kabuk acamaz, sadece asagidaki iki komutu calistirabilir.
#
#   check  -> baglantiyi dogrular, hicbir sey degistirmez
#   deploy -> /root/deploy.sh (ayni anda tek deploy; ikincisi beklemeden duser)
set -euo pipefail

case "${SSH_ORIGINAL_COMMAND:-}" in
  check)
    echo "deploy-gate ok: $(hostname)"
    ;;
  deploy)
    exec flock -n /tmp/iw-deploy.lock /root/deploy.sh
    ;;
  *)
    echo "deploy-gate: izin verilmeyen komut: '${SSH_ORIGINAL_COMMAND:-}'" >&2
    exit 1
    ;;
esac
