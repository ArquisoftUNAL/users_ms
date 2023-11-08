FROM osixia/openldap:1.1.8

COPY ./LDIF/newuser.ldif /ldif/newuser.ldif
COPY ./run.sh /scripts_init_ldap/run.sh

CMD ["--copy-service", "sh", "/scripts_init_ldap/run.sh"]