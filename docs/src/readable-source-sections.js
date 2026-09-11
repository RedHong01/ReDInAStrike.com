// Editorial adaptation of verified design documents. Provenance lives in the Term Review audit workspace.
export const supportingReadableSections = {
  "/to-be-chosen": [
    {
      "kind": "copy-grid",
      "title": "Premise and Narrative Structure",
      "left": {
        "title": "The Premise",
        "en": "To Be Chosen is a narrative-driven survival horror game set around a cheerleading team stranded in a fog-covered mountain village. The village appears to offer shelter, but the team gradually finds signs of a ritual that has happened before.",
        "zh": "《To Be Chosen》是一款以生存恐怖为核心的叙事游戏。啦啦队在一座被浓雾包围的山村受困，村庄看似提供庇护，队员却逐渐发现这里曾经反覆进行某种仪式。"
      },
      "right": {
        "title": "The Perspective System",
        "en": "The design uses an asymmetrical, episodic perspective structure. Each character sees only part of the situation, while the player connects the fragments across the squad. The story is proposed as a sequence of limited viewpoints rather than one uninterrupted account.",
        "zh": "设计采用非对称、分段式的多视角结构。每个角色只能看见事件的一部分，玩家则要把整个队伍的片段连在一起。故事被设计成一连串受限的视角，而不是一段不中断的单一路线。"
      }
    },
    {
      "kind": "text",
      "title": "Scene Proposal / After the Bus Accident",
      "paragraphs": [
        {
          "en": "The first proposed perspective split happens after the bus accident. Sarah investigates the missing driver and the accident while Alexis stays with the girls and manages the tension on the bus. The two strands move at the same time. Sarah’s investigation brings the village into view and exposes her actions to the elders, while the girls wait without knowing what has happened to her.",
          "zh": "第一个多视角提案发生在巴士事故之后。Sarah 调查失踪的司机与事故，Alexis 则留在车上处理队伍里的紧张关系。两条线同时推进：Sarah 的调查带出村庄，也让长老注意到她的行动；留在车上的队员则不知道她遇到了什么。"
        },
        {
          "en": "This example shows why the perspective shift exists. The player does not receive the whole situation from above; they learn what each group can observe, then compare the gaps when the story moves to another character. This is a design example from the narrative document, not a verified playable recording.",
          "zh": "这个例子说明视角切换为什么存在。玩家不会从全知角度直接得到完整情况，而是先知道每一组角色能观察到什么，再在切换到另一个角色时比较资讯缺口。这是叙事文件中的设计例子，还不是已核对的可玩录影。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Narrative Methods",
      "items": [
        [
          "MULTI-POV",
          "Shift the player’s limited viewpoint as the plot moves between characters.",
          "随着剧情转移到不同角色，切换玩家受限的视角。"
        ],
        [
          "ENVIRONMENT",
          "Use spaces, marks, calendars, and room patterns to suggest how the village operates.",
          "用空间、符号、日历与房间的模式提示村庄如何运作。"
        ],
        [
          "RELICS",
          "Let diaries, ledgers, and victim records expose a pattern that dialogue has not explained.",
          "让日记、名册与受害者留下的记录揭露对话没有说明的模式。"
        ],
        [
          "MICRO-CUTSCENES",
          "Use short, contextual reveals to increase pressure without removing the character’s point of view.",
          "用短而有情境的揭示增加压力，同时保留角色自身的视角。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "What the Environment Reveals",
      "paragraphs": [
        {
          "en": "The village is meant to feel cold, organised, and hostile rather than randomly frightening. In the inn example, half-finished teacups and a calendar with every month crossed out except tonight suggest that the disappearances follow a pattern. In the basement example, narrowing corridors and restraint devices change the space from a place of shelter into a place built for captives.",
          "zh": "村庄被设计成冷漠、有秩序而且具有敌意的地方，而不是随机制造惊吓。在旅店例子里，喝到一半的茶杯和只留下今晚空白的日历，暗示失踪事件有固定模式；在地下室例子里，逐渐变窄的走廊与拘束装置，让空间从庇护所变成为囚禁而建的地方。"
        },
        {
          "en": "The player is expected to read these details as evidence. The document describes a shift from reacting to a strange place to recognising the rules behind it. That shift is a design intention; the material does not include a measured player test for it.",
          "zh": "玩家被期待把这些细节当成证据来阅读。文件描述的变化，是从对陌生场所做出反应，逐渐转向辨认它背后的规则。这是设计意图，现有材料没有提供量化的玩家测试。"
        }
      ]
    },
    {
      "kind": "flow",
      "title": "Fragment → Connection",
      "steps": [
        [
          "PERSPECTIVE",
          "Follow one character’s limited view.",
          "跟随一个角色受限的视角。"
        ],
        [
          "DISCOVERY",
          "Inspect a space, object, or record.",
          "调查空间、物件或记录。"
        ],
        [
          "COMPARISON",
          "Re-evaluate earlier clues against another fragment.",
          "把另一个片段拿来重新理解先前的线索。"
        ],
        [
          "TRANSITION",
          "Move to another viewpoint with a different part of the situation.",
          "转移到看见另一部分情况的角色视角。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Evidence Boundary",
      "paragraphs": [
        {
          "en": "The documents establish the narrative premise, the perspective examples, and the intended relationship between clues and player understanding. They do not include a complete matched recording of one scene. The next useful evidence is one continuous sequence from entering a scene, investigating an object, changing point of view, and showing what new information the player receives.",
          "zh": "现有文件能证明叙事前提、视角例子，以及线索与玩家理解之间的设计关系，但没有一段完整且对应版本的场景录影。下一份有用的证据，是从进入场景、调查物件、切换视角到展示玩家取得的新资讯的一段连续流程。"
        }
      ]
    }
  ],
  "/alt-controller-2025-b": [
    {
      "kind": "copy-grid",
      "title": "Prepare. Slice. Serve.",
      "left": {
        "title": "The Sequence",
        "en": "SushiGo organises the kitchen around one physical sequence: pick up the knife, cut the salmon, pick up the slice, combine it with rice, place the sushi on a plate, and send the plate into the serve zone.",
        "zh": "SushiGo 把厨房整理成一段身体操作流程：拿起刀、切三文鱼、拿起鱼片、把鱼片和米饭合并、将寿司放到盘子上，再把盘子送进出餐区。"
      },
      "right": {
        "title": "Gesture Design",
        "en": "I split the gestures by what the hand is doing: a full grasp for food, a turn of the wrist to angle the fish, and a look-and-pinch for menus. Kitchen actions and interface actions never share a gesture, so a player never presses a button when they meant to pick something up.",
        "zh": "我按手在做什么来划分手势：整只手抓握用于拿食物，转动手腕用于调整鱼片角度，看向并捏合用于菜单。厨房动作和界面操作从不共用同一个手势，所以玩家不会在想拿东西的时候误按到按钮。"
      }
    },
    {
      "kind": "text",
      "title": "The Tutorial Teaches the Handoff",
      "paragraphs": [
        {
          "en": "The tutorial starts by asking the player to close a hand around the knife. While still holding it, the player moves the blade through the salmon and exits the fish to complete the cut. The player then releases the knife, picks up a salmon slice, places it on the rice, and rotates the wrist to adjust the fish angle when needed.",
          "zh": "教学先请玩家握住刀具。保持抓取时，玩家把刀刃穿过三文鱼，并让刀刃离开鱼身完成切割。接着玩家放下刀，拿起鱼片，把鱼片放到米饭上；需要时再旋转手腕调整鱼片角度。"
        },
        {
          "en": "After the sushi is merged, the player grasps the finished piece and releases it over a plate, and the plate travels into the SERVE zone. Every step answers a real hand movement, so the order of a kitchen becomes something you do rather than something you read.",
          "zh": "寿司合并后，玩家抓起做好的寿司，把它放到盘子上，盘子随即送进 SERVE 出餐区。每一步都对应一个真实的手部动作，于是厨房的工序变成了你亲手去做的事，而不是需要去读的说明。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Gesture → Result",
      "items": [
        [
          "GRIP",
          "Close the hand to pick up the knife, fish, or finished sushi.",
          "合拢手掌，拿起刀、鱼片或完成的寿司。"
        ],
        [
          "CUT",
          "Move the blade through the salmon and out the other side.",
          "让刀刃穿过三文鱼并从另一侧离开。"
        ],
        [
          "ROTATE",
          "Rotate the wrist while holding the fish to adjust its yaw.",
          "抓住鱼片时旋转手腕，调整鱼片的水平角度。"
        ],
        [
          "PINCH",
          "Use gaze and pinch for menu buttons and setup controls.",
          "用凝视与捏取操作菜单按钮和设置控制。"
        ],
        [
          "MEASURE",
          "The slice is measured against an ideal cut, so a steadier hand earns more.",
          "鱼片会和理想尺寸比较，所以手越稳，赚得越多。"
        ],
        [
          "NO CONTROLLER",
          "There is nothing to hold but the food: grip, wrist and gaze are the whole interface.",
          "除了食物，手里什么都不用拿：抓握、手腕和目光就是全部的操作界面。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Size Becomes Reward",
      "paragraphs": [
        {
          "en": "Once the fish is on the rice, the game compares the slice with an ideal size. A dish starts at 5 money, and a cut within 10% of ideal adds 15, within 30% adds 10, within 50% adds 5. I wanted the reward to live in the hands: a careful cut is worth three times a rushed one.",
          "zh": "鱼片放到米饭上之后，游戏会把它和理想尺寸比较。一份寿司从 5 块钱起算：误差在 10% 以内加 15，30% 以内加 10，50% 以内加 5。我希望奖励落在双手上：一刀切得仔细，价值是匆忙一刀的三倍。"
        }
      ]
    },
    {
      "kind": "flow",
      "title": "Serving Sequence",
      "steps": [
        [
          "PICK UP",
          "Take the knife or fish with a full-hand grasp.",
          "用完整手掌抓取拿起刀或鱼片。"
        ],
        [
          "PREPARE",
          "Cut the salmon and place it on the rice.",
          "切割三文鱼并把鱼片放到米饭上。"
        ],
        [
          "PLATE",
          "Release the finished sushi over a plate.",
          "把完成的寿司放到盘子上。"
        ],
        [
          "SERVE",
          "Let the plate enter the delivery zone.",
          "让盘子进入出餐区。"
        ]
      ]
    },
    {
      "kind": "text",
      "kicker": "Iteration",
      "title": "Scope and Iteration",
      "paragraphs": [
        {
          "en": "I planned the demo as four phases and then noted “All four now”: one 48-second pass through preparing, slicing, assembling and serving, built out towards a three-to-five-minute session for a first-time player.",
          "zh": "我把试玩版规划成四个阶段，之后在记录里写下“All four now”：一次 48 秒、走完备料、切鱼、组合和出餐的完整流程，再逐步扩展成给新玩家的三到五分钟体验。"
        },
        {
          "en": "The game began on Leap Motion hand tracking and moved to Apple Vision Pro, where the hands need no controller at all: grasp to hold, look and pinch to press. The move let the kitchen stay entirely in the player’s own hands.",
          "zh": "这个游戏最早用 Leap Motion 做手部追踪，后来搬到 Apple Vision Pro 上，双手完全不需要控制器：抓握就是拿起，看向并捏合就是按下。这次迁移让整个厨房都留在玩家自己的手里。"
        }
      ]
    }
  ],
  "/analog-game": [
    {
      "kind": "copy-grid",
      "title": "Overview and Target Player",
      "left": {
        "title": "Build n Shoot",
        "en": "The fourth-iteration GDD describes Build n Shoot as a turn-based strategy shooting game for up to four players, played on a 15 × 15 grid of floating islands. Players are mages competing for control of ancient land, using arcane resources to construct platforms and bullet-blocking bunkers while marking territory.",
        "zh": "第四版 GDD 把 Build n Shoot 定义为一款最多四人的回合制策略射击游戏，发生在由 15 × 15 格组成的浮空岛上。玩家扮演争夺古老土地控制权的法师，用神秘资源建造平台与挡子弹的掩体，同时标记领地。"
      },
      "right": {
        "title": "Target Player",
        "en": "The document names strategy-game enthusiasts, achiever-type and killer-type players, and players who enjoy fantasy and magic themes. Its three game pillars are strategically traversing, building, and shooting.",
        "zh": "文件把策略游戏爱好者、Achiever 型与 Killer 型玩家，以及喜欢奇幻和魔法题材的玩家列为目标玩家。游戏的三个支柱是有策略地移动、建造与射击。"
      }
    },
    {
      "kind": "system-grid",
      "title": "Three Game Pillars",
      "items": [
        [
          "TRAVERSE",
          "Spend movement to claim routes and reach useful positions.",
          "花费移动资源占据路线并抵达有利位置。"
        ],
        [
          "BUILD",
          "Place blocks and territory marks that change the board.",
          "放置方块与领地标记，改变棋盘。"
        ],
        [
          "SHOOT",
          "Use position, D6 range, and territory marks to resolve a shot.",
          "利用位置、D6 射程与领地标记结算射击。"
        ]
      ]
    },
    {
      "kind": "flow",
      "title": "One Turn",
      "steps": [
        [
          "ACTION CARD",
          "Move, shoot, build, use an item, or place a unit.",
          "移动、射击、建造、使用物品或放置单位。"
        ],
        [
          "SETTLEMENT",
          "Check the surrounding nine grid spaces and collect items.",
          "检查周围九格并收集物品。"
        ],
        [
          "AI ACTIVITY",
          "Surviving AI units take one turn according to their behaviour logic.",
          "存活的 AI 单位依照行为逻辑完成一个回合。"
        ],
        [
          "PURCHASE",
          "Spend resource cards on items before the next player begins.",
          "在下一位玩家开始前，用资源卡购买物品。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Position Changes the Shot",
      "paragraphs": [
        {
          "en": "Movement uses a D6 on the square grid, and the player places a territory mark on every grid space they pass through. Passing over another player’s marks overwrites them. A player can climb the blocks they build, but reaching a higher level costs an additional point on the movement roll.",
          "zh": "移动系统在方格棋盘上使用 D6，玩家经过的每一格都会放置自己的领地标记。经过其他玩家的标记时，原本的标记会被覆盖。玩家可以爬上自己建造的方块，但抵达更高层需要在移动掷骰上多付一点。"
        },
        {
          "en": "Shooting also starts with a D6. The bullet travels in a straight line, and every one of the player’s territory marks along that line adds one unit to the range. Elevation changes the interaction: a higher player can shoot over lower obstacles, while a lower shot can destroy a block at the higher position.",
          "zh": "射击同样从 D6 开始。子弹沿直线移动，沿途每经过一个自己的领地标记，射程就增加一格。高度会改变射击关系：高处玩家可以越过较低的障碍物射击，而低处射击则可以摧毁高处的一个方块。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Inventory Weight",
      "items": [
        [
          "10 WEIGHTS",
          "A player can hold up to ten weights of cards and items.",
          "玩家最多持有十个重量单位的卡牌与物品。"
        ],
        [
          "STACKING",
          "Some cards remain one weight until their stack limit is reached.",
          "部分卡牌在达到堆叠上限前仍只算一个重量。"
        ],
        [
          "SURVIVAL",
          "HP and Action cards stay useful, but carrying more of them leaves less room for tactical options.",
          "HP 与行动卡很重要，但带得越多，就越少空间留给战术选项。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Fourth Iteration and Playtest Problem",
      "paragraphs": [
        {
          "en": "The fourth iteration revises the AI system to clarify situational mechanics and updates progression around that revision. The GDD records this as a rules change; it does not include a measured before-and-after result for player understanding.",
          "zh": "第四版修订了 AI 系统，让情境机制更清楚，并配合这次修订更新游戏进程。GDD 把它记录成规则改动，但没有提供玩家理解度的改版前后量化结果。"
        },
        {
          "en": "The playtest note says that the basic actions—moving, shooting, and building obstacles—were generally understood. The flow became dense when players had to remember progression rules, and some repeatedly asked the GM how an AI unit should move. The design question is how to keep the strategic turn without making the rules handoff carry the turn for the player.",
          "zh": "测试笔记指出，基础行动——移动、射击与建造障碍——大致能被理解。当玩家需要记住进程规则时，流程变得拥挤；有些玩家反覆询问 GM AI 单位应如何移动。设计问题是如何保留策略回合，同时不要让 GM 的规则交接代替玩家完成回合。"
        }
      ]
    },
    {
      "kind": "text",
      "title": "Open Test",
      "paragraphs": [
        {
          "en": "The next useful evidence is a short recorded match in which one player explains a complete turn without reopening the rules document. I would compare the explanation with the AI phase, purchase phase, and end-of-turn transition before claiming that the fourth-iteration rules are easier to learn.",
          "zh": "下一份有用的证据，是一段短对局录影：让一名玩家不重新打开规则文件，直接说出完整回合。我会把这段说明和 AI 阶段、购买阶段及回合结束的转换对照，再决定能不能说第四版规则更容易学习。"
        }
      ]
    }
  ],
  "/curtain": [
    {
      "kind": "copy-grid",
      "kicker": "Player experience",
      "title": "The House and the Visitor",
      "left": {
        "title": "The House",
        "en": "Curtain is a game about building a house while you live in it. You buy rooms, carry them into place, and rooms that touch fuse into one space. Where two rooms share an edge exactly three cells long, a door appears; anywhere else the seam simply opens. The shape you build is the shape of every way out you will have later.",
        "zh": "Curtain 是一个“边住边盖房子”的游戏。你买下房间、把它们搬到位，相接的房间会融合成一个空间。两个房间的共享边正好三格长时，那里会出现一扇门；其他地方的接缝则直接打通。你盖出来的形状，就是之后你所有退路的形状。"
      },
      "right": {
        "title": "The Visitor",
        "en": "Outside, something asks the only line the game ever writes down: “I’m so cold, may I come in?” It watches through open windows, walks to a door on the outside, breaks it, and follows you room by room — seen only as footprints. The request is the horror: every opening you make for light or passage is also a way in.",
        "zh": "屋外，有个东西说出游戏里唯一写下的一句话：“我好冷，可以让我进来吗？”它透过打开的窗户看着你，走到外侧的门前，把门撞开，再一间一间地跟着你——你只看得到它的脚印。这句请求本身就是恐怖所在：你为了光线或通行而打开的每一个口子，也都是它进来的路。"
      }
    },
    {
      "kind": "system-grid",
      "title": "The Rules the House Runs On",
      "items": [
        [
          "BUY",
          "Rooms come from a shop with a two-click confirm, and a new room sticks to your cursor until you place it.",
          "房间从商店买，需要点两次确认；买下的房间会吸附在光标上，直到你把它放好。"
        ],
        [
          "MANAGE",
          "Enter switches between walking and managing. Managing freezes you in place and lets you pick up whole rooms, with you inside them.",
          "Enter 在行走和管理之间切换。管理时你会停在原地，可以把整个房间连同屋里的你一起搬走。"
        ],
        [
          "FUSE",
          "Rooms that overlap or share an edge become one room. Touching only at a corner does not count.",
          "重叠或共享一条边的房间会合成一个房间；只在角上相碰不算。"
        ],
        [
          "DOOR",
          "A door appears only at the moment two rooms fuse, on a shared edge exactly three cells long: the middle cell opens, the two sides stay wall.",
          "门只在两个房间融合的那一刻出现，而且共享边必须正好三格：中间一格是门洞，两侧仍是墙。"
        ],
        [
          "WINDOW",
          "Scroll a curtain open to let daylight in. In my first version daylight paid for new rooms, and an open window was also how the visitor saw you.",
          "滚动鼠标拉开窗帘，让阳光进来。在我的第一版里，阳光能换来新房间，而一扇开着的窗，也正是访客看见你的途径。"
        ],
        [
          "NIGHT",
          "A day runs from morning to afternoon to dusk to night, and the sky behind the house follows it. Night is when the visitor comes.",
          "一天从早晨、下午、黄昏走到夜晚，房子背后的天色随之变化。夜晚，就是访客到来的时候。"
        ]
      ]
    },
    {
      "kind": "flow",
      "kicker": "Player flow",
      "title": "One Day in the House",
      "steps": [
        [
          "MORNING",
          "Open the curtains and let the light in",
          "拉开窗帘，让光进来"
        ],
        [
          "BUILD",
          "Buy a room and fit it to the house",
          "买一个房间，把它接到房子上"
        ],
        [
          "DUSK",
          "The light stops paying; open windows become a risk",
          "阳光不再带来收入，开着的窗成了风险"
        ],
        [
          "NIGHT",
          "The visitor asks to come in, and footprints show where it goes",
          "访客请求进门，脚印显示它往哪里走"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "What the Build Plays Today",
      "paragraphs": [
        {
          "en": "The build below is the house-building half: the shop, managing and fusing rooms, doors that appear where rooms meet, and the day turning behind them. The visitor and the window economy come from my first version and are being reconnected to fused rooms, so this is the version to try the building in, and the next one is where the night comes back.",
          "zh": "下面的版本是“盖房子”的那一半：商店、管理和融合房间、在房间交界处出现的门，以及背后流转的一天。访客和窗户经济来自我的第一版，正在重新接到融合后的房间上。所以这一版适合体验盖房子，而下一版会把夜晚带回来。"
        }
      ]
    }
  ]
}
