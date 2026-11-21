Summary:	A GNU collection of diff utilities
Name:		diffutils
Version:	3.12
Release:	3
License:	GPLv2+
Group:		Development/Other
Url:		https://www.gnu.org/software/diffutils/
Source0:	https://ftp.gnu.org/gnu/diffutils/%{name}-%{version}.tar.xz
BuildSystem:	autotools
BuildOption:	--without-included-regex
BuildOption:	--with-packager="%{distribution}"
BuildOption:	--with-packager-bug-reports="%{bugurl}"
BuildRequires:	gettext-devel
BuildRequires:	texinfo
BuildRequires:	help2man
BuildRequires:	autoconf
BuildRequires:	automake
BuildRequires:	pkgconfig(zlib-ng)

%patchlist
diffutils-mkdir_p.patch
diffutils-3.3-change-default-editor-from-ed-to-vi.patch
diffutils-3.8-fix-clang.patch
diffutils-binary-diffs.patch

%description
Diffutils includes four utilities:  diff, cmp, diff3 and sdiff.

  * Diff compares two files and shows the differences, line by line.
  * The cmp command shows the offset and line numbers where two files differ,
    or cmp can show the characters that differ between the two files.
  * The diff3 command shows the differences between three files. Diff3 can be
    used when two people have made independent changes to a common original;
    diff3 can produce a merged file that contains both persons' changes and
    warnings about conflicts.
  * The sdiff command can be used to list diff of two files side by side or
    merge two files interactively.

Install diffutils if you need to compare text files.

%conf -p
export ac_cv_libsigsegv=no
%if %{cross_compiling}
export gl_cv_func_strcasecmp_works=yes
%endif

%build -p
export ac_cv_libsigsegv=no
%if %{cross_compiling}
export gl_cv_func_strcasecmp_works=yes
# help2man cannot execute the just-built target binaries
touch man/*.1
%endif

%install -a
%find_lang %{name}

%files -f %{name}.lang
%doc NEWS README
%{_bindir}/*
%doc %{_mandir}/man*/*
%doc %{_infodir}/%{name}.info*