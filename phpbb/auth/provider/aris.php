<?php
 //Phil copy/pasted this from https://wiki.phpbb.com/Authentication_providers on 10/14/16

namespace phpbb\auth\provider; //phil added this because all the other .php files here have it

/**
 *
 * @package auth
 * @copyright (c) 2013 phpBB Group
 * @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
 *
 */

/**
 * @ignore
 */
if (!defined('IN_PHPBB'))
{
  exit;
}

/**
 * Database authentication provider for phpBB3
 *
 * This is for authentication via the integrated user table
 *
 * @package auth
 */
//class aris implements phpbb_auth_provider_base // phil replaced this
class aris extends \phpbb\auth\provider\base // with this
{
  //phil copied this from apache.php
  public function __construct(\phpbb\db\driver\driver_interface $db, \phpbb\config\config $config, \phpbb\passwords\manager $passwords_manager, \phpbb\request\request $request, \phpbb\user $user, $phpbb_root_path, $php_ext)
  {
    $this->db = $db;
    $this->config = $config;
    $this->passwords_manager = $passwords_manager;
    $this->request = $request;
    $this->user = $user;
    $this->phpbb_root_path = $phpbb_root_path;
    $this->php_ext = $php_ext;
  }

  /**
   * {@inheritdoc}
   */
  public function login($username, $password)
  {
    // Auth plugins get the password untrimmed.
    // For compatibility we trim() here.
    $password = trim($password);

    // do not allow empty password
    if (!$password)
    {
      return array(
          'status'    => LOGIN_ERROR_PASSWORD,
          'error_msg' => 'NO_PASSWORD_SUPPLIED',
          'user_row'  => array('user_id' => ANONYMOUS),
          );
    }

    if (!$username)
    {
      return array(
          'status'    => LOGIN_ERROR_USERNAME,
          'error_msg' => 'LOGIN_ERROR_USERNAME',
          'user_row'  => array('user_id' => ANONYMOUS),
          );
    }


    $args = new \stdClass();
    $args->user_name = $username;
    $args->password  = $password;
    $args->permission = "read_write";

    $c = curl_init(); 

    $class = "users";
    $function = "logIn";
    curl_setopt($c,CURLOPT_URL,"arisgames.org/server/json.php/v2.".$class.".".$function);
    curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
    $str = json_encode($args);
    curl_setopt($c,CURLOPT_POST,true);
    curl_setopt($c,CURLOPT_POSTFIELDS,$str);
    curl_setopt($c,CURLOPT_HTTPHEADER, array(
          'Content-Type: application/json',
          'Content-Length: '.strlen($str))
        );

    $response = curl_exec($c);
    curl_close($c);
    $ret = json_decode($response);

    if($ret->returnCode != 0)
    {
      return array(
        'status'    => LOGIN_ERROR_EXTERNAL_AUTH,
        'error_msg' => 'LOGIN_ERROR_EXTERNAL_AUTH_ARIS',
        'user_row'  => array('user_id' => ANONYMOUS),
      );
    }

    $aris_data = $ret->data;

    //aris login successful, try phpbb login
    $username_clean = utf8_clean_string($username);

    //$sql = 'SELECT user_id, username, user_password, user_passchg, user_pass_convert, user_email, user_type, user_login_attempts
    $sql = 'SELECT user_id, username, user_password, user_passchg, user_email, user_type, user_login_attempts
      FROM ' . USERS_TABLE . "
      WHERE username_clean = '" . $this->db->sql_escape($username_clean) . "'";
    $result = $this->db->sql_query($sql);
    $phpbb_row = $this->db->sql_fetchrow($result);
    $this->db->sql_freeresult($result);

    if($phpbb_row) //both aris and phpbb successful
    {
      return array(
          'status'    => LOGIN_SUCCESS,
          'error_msg' => false,
          'user_row'  => $phpbb_row,
          );
    }
    else //just aris successful- create phpbb
    {
      // this is the user's first login so create an empty profile
      return array(
        'status'    => LOGIN_SUCCESS_CREATE_PROFILE,
        'error_msg' => false,
        'user_row'  => $this->user_row($username, "banana", $aris_data->email),
      );
    }

  }

  //copied from apache.php
  private function user_row($username, $password, $email)
  {
    // first retrieve default group id
    $sql = 'SELECT group_id FROM ' . GROUPS_TABLE . " WHERE group_name = '" . $this->db->sql_escape('REGISTERED') . "' AND group_type = " . GROUP_SPECIAL;
    $result = $this->db->sql_query($sql);
    $row = $this->db->sql_fetchrow($result);
    $this->db->sql_freeresult($result);

    if (!$row) { trigger_error('NO_GROUP'); }

    // generate user account data
    return array(
      'username'      => $username,
      'user_password' => $this->passwords_manager->hash($password),
      'user_email'    => $email,
      'group_id'      => (int) $row['group_id'],
      'user_type'     => USER_NORMAL,
      'user_ip'       => $this->user->ip,
      'user_new'      => ($this->config['new_member_post_limit']) ? 1 : 0,
    );
  }

}

?>
