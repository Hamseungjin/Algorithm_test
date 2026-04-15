package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "ALR20_MEMBER")
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEMBER_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TEAM_ID", nullable = false)
    private alr20_team team;

    /** 팀 내 순번 (1 = 팀장) */
    @Column(name = "SEQUENCE", nullable = false)
    @NotNull
    private Integer sequence;

    /** 계급 코드 */
    @Column(name = "RANK", nullable = false, length = 20)
    @NotNull
    private String rank;

    /** 계급명 (한글 표시명) */
    @Column(name = "RANK_NAME", nullable = false, length = 20)
    @NotNull
    private String rankName;

    @Column(name = "NAME", nullable = false, length = 20)
    @NotNull
    private String name;

    /** 생년월일 (YYYY-MM-DD) */
    @Column(name = "BIRTHDAY", nullable = false, length = 10)
    @NotNull
    private String birthday;

    @Column(name = "PHONE", nullable = false, length = 20)
    @NotNull
    private String phone;

    @Column(name = "MAIL", nullable = false, length = 100)
    @NotNull
    private String mail;

    /** 소속 부대/기관 */
    @Column(name = "MAIN_GROUP", nullable = false, length = 30)
    @NotNull
    private String mainGroup;
}
