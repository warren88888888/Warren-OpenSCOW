/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { arrayContainsElement } from "@scow/utils";
import { ItemType } from "antd/es/menu/interface";
import Link from "next/link";
import Router from "next/router";
import React from "react";
import { match } from "src/layouts/base/matchers";
import { NavItemProps } from "src/layouts/base/types";

export const iconToNode = (Icon: any) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon />;
};

export const EXTERNAL_URL_PREFIX = ["http://", "https://"];

export function createMenuItems(
  routes: NavItemProps[],
  pathname: string,
  parentClickable: boolean,
) {

  function createMenuItem(route: NavItemProps): ItemType {
    if (arrayContainsElement(route.children)) {
      return {
        icon: iconToNode(route.Icon),
        key: route.path,
        title: route.text,
        label: route.text,
        onTitleClick:(route.clickable ?? parentClickable)
          ? () => {
            const target = route.clickToPath ?? route.path;
            route.handleClick?.();
            if (route.openInNewPage) {
              window.open(target);
            } else {
              if (EXTERNAL_URL_PREFIX.some((pref) => target.startsWith(pref))) {
                window.location.href = target;
              } else {
                void Router.push(target);
              }
            }
          }
          : undefined,
        children: createMenuItems(route.children, pathname, parentClickable),
      } as ItemType;
    }

    return {
      icon: iconToNode(route.Icon),
      key: route.path,
      label: (
        <Link
          href={route.clickToPath ?? route.path}
          {...route.openInNewPage ? { target: "_blank" } : {}}
          style={{ textDecoration:"none" }}
        >
          {route.text}
        </Link>
      ),
      onClick: () => {
        route.handleClick?.();
      },
    } as ItemType;
  }

  const items = routes
    .filter((x) => !x.hideIfNotActive || match(x, pathname))
    .map((r) => createMenuItem(r));

  return items;
}

export function calcActiveKeys(links: NavItemProps[], pathname: string): Set<string> {

  const selectedKeys = new Set<string>();

  for (const link of links) {
    if (arrayContainsElement(link.children)) {
      const childrenSelectedKeys = calcActiveKeys(link.children, pathname);
      for (const childKey of childrenSelectedKeys) {
        selectedKeys.add(childKey);
      }
    }

    if (
      link.children?.some((x) => selectedKeys.has(x.path)) ||
      (link.path === "/" && pathname === "/") ||
        (link.path !== "/" && link.path !== "" && match(link, pathname))
    ) {
      selectedKeys.add(link.path);
    }
  }

  return selectedKeys;
}
