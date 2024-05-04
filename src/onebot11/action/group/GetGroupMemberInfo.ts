import { OB11GroupMember } from '../../types';
import { getGroup, getGroupMember } from '@/core/data';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
import { log, logDebug } from '@/common/utils/log';
import { isNull } from '../../../common/utils/helper';
import { WebApi, WebApiGroupMember } from '@/core/apis/webapi';


export interface PayloadType {
  group_id: number;
  user_id: number;
  no_cache?: boolean | string;
}

class GetGroupMemberInfo extends BaseAction<PayloadType, OB11GroupMember> {
  actionName = ActionName.GetGroupMemberInfo;

  protected async _handle(payload: PayloadType) {
    const group = await getGroup(payload.group_id.toString());
    if (!group) {
      throw (`群(${payload.group_id})不存在`);
    }
    const webGroupMembers: WebApiGroupMember[] = [];
    if (payload.no_cache === true || payload.no_cache === 'true') {
      // webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
    }
    const member = await getGroupMember(payload.group_id.toString(), payload.user_id.toString());
    // log(member);
    if (member) {
      logDebug('获取群成员详细信息');
      try {
        const info = (await NTQQUserApi.getUserDetailInfo(member.uid));
        logDebug('群成员详细信息结果', info);
        Object.assign(member, info);
      } catch (e) {
        logDebug('获取群成员详细信息失败, 只能返回基础信息', e);
      }
      const retMember = OB11Constructor.groupMember(payload.group_id.toString(), member);
      for (let i = 0, len = webGroupMembers.length; i < len; i++) {
        if (webGroupMembers[i]?.uin && webGroupMembers[i].uin === retMember.user_id) {
          retMember.join_time = webGroupMembers[i]?.join_time;
          retMember.last_sent_time = webGroupMembers[i]?.last_speak_time;
          retMember.qage = webGroupMembers[i]?.qage;
          retMember.level = webGroupMembers[i]?.lv.level;
        }
      }
      return retMember;
    } else {
      throw (`群(${payload.group_id})成员${payload.user_id}不存在`);
    }
  }
}

export default GetGroupMemberInfo;
