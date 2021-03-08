FROM alpine:latest

# Steps done in one RUN layer:
# - Install packages
# - Fix default group (1000 does not exist)
# - OpenSSH needs /var/run/sshd to run
# - Remove generic host keys, entrypoint generates unique keys
RUN echo "@community http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    apk add --no-cache bash shadow@community openssh openssh-sftp-server rsyslog supervisor zip incron && \
    sed -i 's/GROUP=1000/GROUP=100/' /etc/default/useradd && \
    mkdir -p /var/run/sshd && \
    rm -f /etc/ssh/ssh_host_*key* && \
    sed -i -e 's/^root::/root:!:/' /etc/shadow

COPY files/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY files/sshd.conf /etc/rsyslog.d/sshd.conf
COPY files/rsyslog.conf /etc/rsyslog.conf
COPY files/sshd_config /etc/ssh/sshd_config
COPY files/create-sftp-user /usr/local/bin/
COPY files/incronRule /
COPY files/incron.sh /
COPY files/entrypoint /

EXPOSE 22

ENTRYPOINT ["/entrypoint"]
