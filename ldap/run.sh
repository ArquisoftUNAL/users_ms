echo Starts
sleep 10
echo Stops Waiting
ldapadd -x -D "cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co" -w admin -f /ldif/newuser.ldif >> echo
echo Ends
# Waits forever and keeps the container running
tail -f /dev/null