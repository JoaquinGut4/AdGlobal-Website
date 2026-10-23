"""Genera una CA local y un certificado HTTPS para probar cámara desde la LAN."""

from __future__ import annotations

import argparse
from datetime import UTC, datetime, timedelta
from ipaddress import ip_address
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID


ROOT = Path(__file__).resolve().parents[2]


def write_key(path: Path, key) -> None:
    path.write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.TraditionalOpenSSL, serialization.NoEncryption()))


def generate(ip: str) -> None:
    directory = ROOT / ".cert"
    directory.mkdir(exist_ok=True)
    now = datetime.now(UTC)

    ca_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    ca_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "AD GLOBAL Development CA")])
    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(ca_name).issuer_name(ca_name).public_key(ca_key.public_key())
        .serial_number(x509.random_serial_number()).not_valid_before(now - timedelta(days=1))
        .not_valid_after(now + timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
        .add_extension(x509.KeyUsage(digital_signature=True, key_encipherment=False, content_commitment=False, data_encipherment=False, key_agreement=False, key_cert_sign=True, crl_sign=True, encipher_only=None, decipher_only=None), critical=True)
        .sign(ca_key, hashes.SHA256())
    )

    server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    server_name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, ip)])
    server_cert = (
        x509.CertificateBuilder()
        .subject_name(server_name).issuer_name(ca_name).public_key(server_key.public_key())
        .serial_number(x509.random_serial_number()).not_valid_before(now - timedelta(days=1))
        .not_valid_after(now + timedelta(days=825))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(x509.SubjectAlternativeName([x509.DNSName("localhost"), x509.IPAddress(ip_address("127.0.0.1")), x509.IPAddress(ip_address(ip))]), critical=False)
        .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
        .sign(ca_key, hashes.SHA256())
    )

    write_key(directory / "dev-ca.key", ca_key)
    (directory / "adglobal-dev-ca.pem").write_bytes(ca_cert.public_bytes(serialization.Encoding.PEM))
    # Android exige DER al instalar una CA desde Ajustes; iOS acepta DER y PEM.
    (directory / "adglobal-dev-ca.crt").write_bytes(ca_cert.public_bytes(serialization.Encoding.DER))
    write_key(directory / "server.key", server_key)
    (directory / "server.crt").write_bytes(server_cert.public_bytes(serialization.Encoding.PEM))
    print(f"Certificados generados en {directory}")
    print(f"Instala en la tablet: {directory / 'adglobal-dev-ca.crt'} (DER)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ip", required=True)
    generate(parser.parse_args().ip)
